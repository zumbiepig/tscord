import { createReadStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { basename, dirname, join, sep } from 'node:path';
import { Readable } from 'node:stream';

import chalk from 'chalk';
import { glob } from 'glob';
import { ImgurClient } from 'imgur';

import { generalConfig } from '@/configs';
import { Image, ImageRepository } from '@/entities';
import { env } from '@/env';
import { Database, Logger } from '@/services';
import { Service } from '@/utils/decorators';
import { getFileHash } from '@/utils/functions';

@Service()
export class ImagesUpload {
	private validImageExtensions = ['.png', '.jpeg', '.jpg', '.gif'];
	private imageFolderPath = join(process.cwd(), 'assets', 'images');

	private imgurClient: ImgurClient | undefined = generalConfig.automaticUploadImagesToImgur
		? new ImgurClient({
				clientId: env.IMGUR_CLIENT_ID,
			})
		: undefined;

	private imageRepo: ImageRepository;

	constructor(
		private db: Database,
		private logger: Logger,
	) {
		this.imageRepo = this.db.get(Image);
	}

	isValidImageFormat(file: string): boolean {
		return this.validImageExtensions.some((extension) => file.endsWith(extension));
	}

	async syncWithDatabase() {
		await mkdir(this.imageFolderPath, { recursive: true });

		// get all images inside the assets folder
		const files = await glob(join('**', '*'), {
			windowsPathsNoEscape: true,
			cwd: this.imageFolderPath,
		});

		const images = [];
		for (const file of files) {
			if (this.isValidImageFormat(file)) images.push(file);
			else
				await this.logger.log(
					'error',
					`Image ${file} has an invalid format. Valid formats: ${this.validImageExtensions.join(', ')}`,
					`Image ${chalk.bold.green(file)} has an invalid format. Valid formats: ${chalk.bold(this.validImageExtensions.join(', '))}`,
				);
		}

		// purge deleted images from the database, reupload expired images to imgur
		const imagesInDb = await this.imageRepo.findAll();
		for (const image of imagesInDb) {
			const imagePath = join(image.basePath, image.fileName);

			if (!images.includes(imagePath)) {
				// delete the image if it is not in the filesystem anymore
				await this.imageRepo.nativeDelete(image);
				await this.deleteImageFromImgur(image);
			} else if (!(await this.isImgurImageValid(image.url))) {
				// reupload if the image is not on imgur anymore
				await this.logger.log(
					'info',
					`Image ${imagePath} was been removed from Imgur so it will be reuploaded`,
					`Image ${chalk.bold.green(imagePath)} was been removed from Imgur so it will be reuploaded`,
				);
				await this.addNewImageToImgur(imagePath, image.hash);
			}
		}

		// check if the image is already in the database and that its sha256 hash is the same.
		for (const imagePath of images) {
			const imageHash = await getFileHash(join(this.imageFolderPath, imagePath));

			const imageInDb = await this.imageRepo.findOne({
				hash: imageHash,
			});

			if (!imageInDb) await this.addNewImageToImgur(imagePath, imageHash);
			else if (imageInDb.basePath !== dirname(imagePath) || imageInDb.fileName !== basename(imagePath))
				await this.logger.log(
					'warn',
					`Image ${imagePath} has the same hash as ${join(imageInDb.basePath, imageInDb.fileName)} so it will be skipped`,
					`Image ${chalk.bold.green(imagePath)} has the same hash as ${chalk.bold.green(join(imageInDb.basePath, imageInDb.fileName))} so it will be skipped`,
				);
		}
	}

	async addNewImageToImgur(imagePath: string, imageHash: string) {
		if (!this.imgurClient) return;

		const basePath = dirname(imagePath);
		const fileName = basename(imagePath);

		// upload the image to imgur
		const uploadResponse = await this.imgurClient.upload({
			image: Readable.toWeb(createReadStream(join(this.imageFolderPath, imagePath))),
			type: 'stream',
		});

		if (!uploadResponse.success) {
			await this.logger.log(
				'error',
				`Error uploading image ${imagePath} to imgur: ${uploadResponse.status.toString()} ${JSON.stringify(uploadResponse.data)}`,
			);
			return;
		}

		// add the image to the database
		const image = new Image();
		image.basePath = basePath;
		image.fileName = fileName;
		image.url = uploadResponse.data.link;
		image.size = uploadResponse.data.size;
		image.hash = imageHash;
		image.deleteHash = uploadResponse.data.deletehash;
		image.tags = basePath.split(sep);
		await this.db.em.persistAndFlush(image);

		// log the success
		await this.logger.log(
			'info',
			`Image ${imagePath} uploaded to imgur`,
			`Image ${chalk.bold.green(imagePath)} uploaded to imgur`,
		);
	}

	async deleteImageFromImgur(image: Image) {
		if (!this.imgurClient || !image.deleteHash) return;

		await this.imgurClient.deleteImage(image.deleteHash);

		await this.logger.log(
			'warn',
			`Image ${image.fileName} deleted from database because it is not in the filesystem anymore`,
		);
	}

	async isImgurImageValid(imageUrl: string): Promise<boolean> {
		if (!this.imgurClient) return false;

		const res = await fetch(imageUrl, { method: 'HEAD' });
		return res.url !== 'https://i.imgur.com/removed.png';
	}
}

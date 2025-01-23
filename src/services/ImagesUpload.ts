import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { cwd } from 'node:process';
import { promisify } from 'node:util';

import axios from 'axios';
import chalk from 'chalk';
import { glob } from 'fast-glob';
import { mkdir } from 'fs/promises';
import { imageHash as callbackImageHash } from 'image-hash';
import { ImgurClient } from 'imgur';

import { Image, ImageRepository } from '@/entities';
import env from '@/env';
import { Database, Logger } from '@/services';
import { Service } from '@/utils/decorators';
import { base64Encode } from '@/utils/functions';

const imageHasher = promisify(callbackImageHash);

@Service()
export class ImagesUpload {
	private validImageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
	private imageFolderPath = join(cwd(), 'assets');

	private imgurClient: ImgurClient | null = env.IMGUR_CLIENT_ID
		? new ImgurClient({
				clientId: env.IMGUR_CLIENT_ID,
			})
		: null;

	private imageRepo: ImageRepository;

	constructor(
		private db: Database,
		private logger: Logger,
	) {
		this.imageRepo = this.db.get(Image);
	}

	isValidImageFormat(file: string): boolean {
		for (const extension of this.validImageExtensions) {
			if (file.endsWith(extension)) return true;
		}

		return false;
	}

	async syncWithDatabase() {
		if (!existsSync(this.imageFolderPath)) await mkdir(this.imageFolderPath);

		// get all images inside the assets folder
		const images = (await glob('**/*', { cwd: this.imageFolderPath })).filter(
			(file) => {
				if (this.isValidImageFormat(file)) {
					return true;
				} else {
					console.warn(
						`Image ${chalk.bold.red(file)} has an invalid format. Valid formats: ${this.validImageExtensions.join(', ')}`,
					);
					return false;
				}
			},
		);

		// purge deleted images from the database, reupload expired images to imgur
		const imagesInDb = await this.imageRepo.findAll();
		for (const image of imagesInDb) {
			const imagePath = join(image.basePath ?? '', image.fileName);

			if (!images.includes(imagePath)) {
				// delete the image if it is not in the filesystem anymore
				await this.imageRepo.nativeDelete(image);
				await this.db.em.flush();
				await this.deleteImageFromImgur(image);
			} else if (!(await this.isImgurImageValid(image.url))) {
				// reupload if the image is not on imgur anymore
				await this.addNewImageToImgur(imagePath, image.hash, true);
			}
		}

		// check if the image is already in the database and that its md5 hash is the same.
		for (const imagePath of images) {
			const imageHash = (await imageHasher(
				join(this.imageFolderPath, imagePath),
				16,
				true,
			)) as string;

			const imageInDb = await this.imageRepo.findOne({
				hash: imageHash,
			});

			if (!imageInDb) await this.addNewImageToImgur(imagePath, imageHash);
			else if (
				imageInDb.basePath !== dirname(imagePath) ||
				imageInDb.fileName !== basename(imagePath)
			)
				console.warn(
					`Image ${chalk.bold.green(imagePath)} has the same hash as ${chalk.bold.green(join(imageInDb.basePath ?? '', imageInDb.fileName))} so it will be skipped`,
				);
		}
	}

	async deleteImageFromImgur(image: Image) {
		if (!this.imgurClient) return;

		await this.imgurClient.deleteImage(image.deleteHash);

		await this.logger.log(
			`Image ${image.fileName} deleted from database because it is not in the filesystem anymore`,
			'info',
		);
	}

	async addNewImageToImgur(
		imagePath: string,
		imageHash: string,
		_reupload = false,
	) {
		if (!this.imgurClient) return;

		// upload the image to imgur
		const base64 = await base64Encode(join(this.imageFolderPath, imagePath));

		try {
			const imageBasePath = dirname(imagePath);
			const imageFileName = basename(imagePath);

			const uploadResponse = await this.imgurClient.upload({
				image: base64,
				type: 'base64',
				name: imageFileName,
			});

			if (!uploadResponse.success) {
				await this.logger.log(
					`Error uploading image ${imageFileName} to imgur: ${uploadResponse.status.toString()} ${JSON.stringify(uploadResponse.data)}`,
					'error',
				);

				return;
			}

			// add the image to the database
			const image = new Image();
			image.basePath = imageBasePath;
			image.fileName = imageFileName;
			image.url = uploadResponse.data.link;
			image.size = uploadResponse.data.size;
			image.tags = imageBasePath.split('/');
			image.hash = imageHash;
			image.deleteHash = uploadResponse.data.deletehash ?? '';
			await this.db.em.persistAndFlush(image);

			// log the success
			await this.logger.log(
				`Image ${chalk.bold.green(imagePath)} uploaded to imgur`,
				'info',
			);
		} catch (error) {
			await this.logger.log(
				error instanceof Error ? error.message : String(error),
				'error',
			);
		}
	}

	async isImgurImageValid(imageUrl: string): Promise<boolean> {
		if (!this.imgurClient) return false;

		const res = await axios.get(imageUrl);
		return !(
			res.request as { path: { includes: (_: string) => boolean } } | undefined
		)?.path.includes('/removed');
	}
}

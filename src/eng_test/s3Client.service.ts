import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { BaseConfigKey } from 'src/common/config/baseConfig';

@Injectable()
export class S3ClientService {
  private S3Client: S3;

  constructor(private readonly configService: ConfigService) {
    this.S3Client = new S3({
      region: this.configService.get(BaseConfigKey.AWS_REGION),
      credentials: {
        accessKeyId: this.configService.get(BaseConfigKey.AWS_ACCESS_KEY),
        secretAccessKey: this.configService.get(BaseConfigKey.AWS_SECRETE_KEY),
      },
    });
  }

  private getUrl(key) {
    return `https://eng-rev.s3.ap-southeast-1.amazonaws.com/${key}`;
  }

  async getImagesData(folderId: string) {
    const objects = await this.S3Client.listObjects({
      Bucket: 'eng-rev',
      Prefix: `Image/${folderId}`,
    }).promise();

    let imagesData: { name: string; url: string }[] = [];
    objects.Contents.forEach((data) => {
      const url = this.getUrl(data.Key);
      const name = data.Key.split('/').pop();
      imagesData.push({ name: name, url: url });
    });
    return imagesData;
  }
}

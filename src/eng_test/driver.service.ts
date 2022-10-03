import * as pathHandler from 'path';
import { google, drive_v3 } from 'googleapis';
import Settings from '../../settings.js';

export class DriverService {
  private readonly driver: drive_v3.Drive;
  constructor() {
    const KEY_FILE_PATH = pathHandler.join(
      Settings.PROJECT_DIR,
      'src/eng_test/engrev_storage_service.json',
    );
    const SCOPES = ['https://www.googleapis.com/auth/drive'];

    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE_PATH,
      scopes: SCOPES,
    });

    this.driver = google.drive({ version: 'v3', auth: auth });
  }

  private getListOfChildrenQuery = (id) => {
    return `'${id}' in parents and trashed=false`;
  };

  async getListOfFiles(folderId) {
    const [listSubFiles_response, createPermission_response] =
      await Promise.all([
        this.driver.files.list({
          q: this.getListOfChildrenQuery(folderId),
        }),
        this.driver.permissions.create({
          fileId: folderId,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        }),
      ]);

    const url = 'https://drive.google.com/uc?id=';

    const subFilesList = listSubFiles_response.data.files;
    const filesData = subFilesList.map((file) => {
      const data = {
        ...file,
        url: url + file.id,
      };
      return data;
    });
    return filesData;
  }
}

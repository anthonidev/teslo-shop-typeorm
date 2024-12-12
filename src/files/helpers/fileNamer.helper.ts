export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: string) => void,
) => {
  const fileExtension = file.originalname.split('.').pop();

  callback(null, `${Date.now()}.${fileExtension}`);
};

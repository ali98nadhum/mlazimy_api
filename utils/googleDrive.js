
const { google } = require("googleapis");
const { Readable } = require('stream');

// This line is const
const SCOPE = ["https://www.googleapis.com/auth/drive"];

// =====================================================
// This function for making authorization to Google Drive
async function authorize() {
  const jwtClint = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY,
    SCOPE
  );

  await jwtClint.authorize();
  return jwtClint;
}

// =====================================================
// This function for uploading file to Google Drive
async function uploadFile(authClient, file) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    const fileMetaData = {
      name: file.originalname, // اسم الملف
      parents: ["1_O5SK7R97aNCwsdKjwAjU2AZuOz5JqZR"], // معرف المجلد
    };

    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer), 
    };

    drive.files.create(
      {
        resource: fileMetaData,
        media: media,
        fields: "id, name, size, parents",
      },
      (error, fileData) => {
        if (error) {
          console.error("Error uploading file to Google Drive:", error);
          return reject(error);
        }
        resolve(fileData.data);
      }
    );
  });
}

// =====================================================
// This function for generating public URLs for files
async function generatePublicUrl(authClient, fileId) {
  const drive = google.drive({ version: "v3", auth: authClient });

  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  const file = await drive.files.get({
    fileId: fileId,
    fields: "webViewLink, webContentLink",
  });

  return {
    webViewLink: file.data.webViewLink,
    webContentLink: file.data.webContentLink,
    publicId: fileId,
  };
}
// =====================================================
// This function for deleting a file from Google Drive
async function deleteFile(authClient, fileId) {
  const drive = google.drive({ version: "v3", auth: authClient });

  try {
    await drive.files.delete({
      fileId: fileId,
    });
    console.log(`File with ID: ${fileId} has been deleted.`);
  } catch (error) {
    console.error(`Error deleting file with ID: ${fileId}`, error);
    throw error;
  }
}

// =====================================================
// Function to handle the file upload process
async function uploadsFile(req, res) {
  try {
    const authClient = await authorize();

    const file = await uploadFile(authClient, req.files.file[0]);

    const fileLinks = await generatePublicUrl(authClient, file.id);

    return {
      fileDetails: file,
      fileLinks: fileLinks,
      id: file.id,
    };
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ message: "File upload failed", error: error.message });
  }
}
// =====================================================

module.exports = {
  uploadsFile,
  deleteFile,
  authorize,
};

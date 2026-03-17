import { axiosInstance } from "./axios";

/**
 * Retrieve an image from the server by filename
 * @param fileName - The path of the file to retrieve
 * @returns Promise with the image data response
 */
export const getImage = async (fileName: string) => {
  try {
    const response = await axiosInstance.post("/generic/getImage", {
      fileName: [fileName],
    });
    console.log("response", response);
    return response.data.data.signedLink[0];
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
};

/**
 * Download an image from the server by filename
 * @param fileName - The path of the file to download
 * @param displayName - Optional custom name for the downloaded file
 */
export const downloadImage = async (fileName: string, displayName?: string) => {
  try {
    const signedUrl = await getImage(fileName);
    console.log("signedUrl", signedUrl);

    // Fetch the image as a blob to ensure proper download
    const response = await fetch(signedUrl);
    const blob = await response.blob();

    // Create object URL from the blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;

    // Set download name - either use provided displayName or extract from fileName
    const downloadName = displayName || fileName.split("/").pop() || "download";
    link.download = downloadName;

    // Append to the document, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL object
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading image:", error);
    throw error;
  }
};

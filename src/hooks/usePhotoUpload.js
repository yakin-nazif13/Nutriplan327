import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadRecipePhoto(file, recipeId, userId) {
  if (!file) return null;
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Photo must be under 5MB.");
  }
  const photoRef = ref(storage, `recipes/${userId}/${recipeId}_${Date.now()}`);
  await uploadBytes(photoRef, file);
  const url = await getDownloadURL(photoRef);
  return url;
}
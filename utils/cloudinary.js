import cloudinary from "cloudinary";

const cloudinary_cloud_name='dxi0gikd0';
const cloudinary_api_key='746324833297541';
const cloudinary_api_secret='BOnIu8VHd7uuBq1n3Np1uKNyenU';

cloudinary.config({
    cloud_name:cloudinary_cloud_name,
    api_key:cloudinary_api_key,
    api_secret:cloudinary_api_secret
})

export default cloudinary;
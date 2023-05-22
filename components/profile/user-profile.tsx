
import classes from './user-profile.module.css';

import { Cloudinary } from '@cloudinary/url-gen';
import React from 'react';

import FileResizer from 'react-image-file-resizer';

const cloudName = 'dmn5oy2qa';

const cld = new Cloudinary({ cloud: { cloudName: cloudName } });

interface UserProfileProps {
    image: string;
    username: string;
    activeUser?: string | null | undefined;
    onChangeProfile: (profile: { image: string; username: string }) => void;
  }
function UserProfile(props: UserProfileProps) {


  function selectImageHandler(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (file) {
        FileResizer.imageFileResizer(
          file,
          1000,
          1000,
          'PNG',
          100,
          0,
          (resizedImage) => {
            if(resizedImage instanceof File || resizedImage instanceof Blob){
            const reader = new FileReader();
            reader.onloadend = () => {
              const convertedFile = new File([resizedImage], file.name, {
                type: file.type,
                lastModified: file.lastModified,
              });
  
              const formData = new FormData();
              formData.append('file', convertedFile);
              formData.append('upload_preset', 'ewqicijo');
  
              fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                method: 'POST',
                body: formData,
              })
                .then((response) => response.json())
                .then((data) => {
                  const imageUrl = cld.image(data.public_id);
                  console.log(imageUrl.toURL());
                  props.onChangeProfile({
                    image: imageUrl.toURL(),
                    username: props.username,
                  });
                })
                .catch((error) => {
                  console.log('Upload error:', error);
                });
            };
            reader.readAsDataURL(resizedImage);
        }else{
            
        }
          },
          'blob'
        );
      }
    }

  function submitHandler(event: React.FormEvent) {
    event.preventDefault();

  }

  return (
    <div className={classes.profile}>
      <img src={props.image} />
      {props.activeUser === props.username ? (
        <form onSubmit={submitHandler}>
          <input type="file" name="file" onChange={selectImageHandler} />
          <button>Change image</button>
        </form>
      ) : null}
      <h2>{props.username}</h2>
    </div>
  );
}

export default UserProfile;

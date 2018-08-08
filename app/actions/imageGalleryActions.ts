// - Import react componetns
import moment from 'moment'

// - Import domain
import { Image } from 'domain/imageGallery'
import { SocialError } from 'domain/common'

// - Import action types
import { ImageGalleryActionType } from 'constants/imageGalleryActionType'

// - Import actions
import * as globalActions from 'actions/globalActions'

// - Import app API
import FileAPI from 'api/FileAPI'

import { IServiceProvider, ServiceProvide } from 'factories'
import { IImageGalleryService } from 'services/imageGallery'

const serviceProvider: IServiceProvider = new ServiceProvide()
const imageGalleryService: IImageGalleryService = serviceProvider.createImageGalleryService()

/* _____________ UI Actions _____________ */

/**
 * Download images for image gallery
 */
export const dbGetImageGallery = () => {
  return (dispatch: any, getState: Function) => {
    let uid: string = getState().authorize.uid
    if (uid) {

      return imageGalleryService.getImageGallery(uid)
        .then((images: Image[]) => {
          dispatch(addImageList(images))
        })
        .catch((error: SocialError) => {
          dispatch(globalActions.showErrorMessage(error.message))
        })
    }
  }

}

/* _____________ CRUD Database_____________ */

/**
 * Save image URL in the server
 * @param  {string} imageURL is the URL of image
 * @param  {string} imageFullPath is the folder name + / + file name
 */
export const dbSaveImage = (imageURL: string,imageFullPath: string) => {
  return (dispatch: any, getState: Function) => {

    let uid: string = getState().authorize.uid
    let image: Image = {
      creationDate: moment().unix(),
      deleteDate: '',
      URL: imageURL,
      fullPath: imageFullPath,
      ownerUserId: uid,
      lastEditDate: 0,
      deleted: false
    }
    return imageGalleryService.saveImage(uid,image)
      .then((imageKey: string) => {
        dispatch(addImage({
          ...image,
          id: imageKey
        }))
      })
      .catch((error: SocialError) => {
        dispatch(globalActions.showErrorMessage(error.message))
      })
  }
}

/**
 * Delete an image from database
 * @param  {string} id of image
 */
export const dbDeleteImage = (id: string) => {
  return (dispatch: any, getState: Function) => {

    // Get current user id
    let uid: string = getState().authorize.uid

    return imageGalleryService.deleteImage(uid,id)
      .then(() => {
        dispatch(deleteImage(id))
      })
      .catch((error: SocialError) => {
        dispatch(globalActions.showErrorMessage(error.message))
      })
  }

}

/**
 * Upload image on the server
 * @param {file} file
 * @param {string} fileName
 */
export const dbUploadImage = (file: any, fileName: string) => {
  return (dispatch: any, getState: Function) => {

    return imageGalleryService
    .uploadImage(file,fileName, (percentage: number) => {
      dispatch(globalActions.progressChange(percentage, true))
    })
    .then(() => {
      dispatch(globalActions.progressChange(100, false))
      dispatch(dbSaveImage(fileName,''))
      dispatch(globalActions.hideTopLoading())
    })
    .catch((error: SocialError) => {
      dispatch(globalActions.showErrorMessage(error.code))
      dispatch(globalActions.hideTopLoading())
    })
  }
}

/**
 * Download image from server
 * @param {string} fileName
 */
export const dbDownloadImage = (fileName: string) => {

  return (dispatch: any, getState: Function) => {
    if (fileName === 'noImage') {
      return {}
    }
    if (getState().imageGallery.imageURLList[fileName] && fileName !== '') {
      return
    }
    if (getState().imageGallery.imageRequests.indexOf(fileName) > -1) {
      return
    }
    dispatch(sendImageRequest(fileName))

    return imageGalleryService.downloadImage(fileName)
      .then((url: string) => {
      // Insert url into an <img> tag to 'download'
        if (!getState().imageGallery.imageURLList[fileName] || fileName === '') {
          dispatch(setImageURL(fileName, url))
        }
      })
    .catch((error: SocialError) => {
      dispatch(globalActions.showErrorMessage(error.message))
    })
  }
}

/* _____________ CRUD State _____________ */

/**
 * Add image list to image gallery
 * @param {Image[]} images is an array of images
 */
export const addImageList = (images: Image[]) => {
  return { type: ImageGalleryActionType.ADD_IMAGE_LIST_GALLERY,payload: images }
}

/**
 * Add image to image gallery
 * @param {Image} image
 */
export const addImage = (image: Image) => {
  return { type: ImageGalleryActionType.ADD_IMAGE_GALLERY, payload: image }
}

/**
 * Delete an image
 * @param  {string} id is an image identifier
 */
export const deleteImage = (id: string) => {
  return { type: ImageGalleryActionType.DELETE_IMAGE, payload: id }

}

/**
 * Delete an image
 */
export const setImageURL = (name: string, url: string) => {
  return {
    type: ImageGalleryActionType.SET_IMAGE_URL,
    payload: { name, url }
  }

}

/**
 * Clear all data in image gallery store
 */
export const clearAllData = () => {
  return {
    type: ImageGalleryActionType.CLEAT_ALL_DATA_IMAGE_GALLERY
  }
}

/**
 * Send image request
 */
export const sendImageRequest = (name: string) => {
  return {
    type: ImageGalleryActionType.SEND_IMAGE_REQUEST,
    payload: name
  }

}

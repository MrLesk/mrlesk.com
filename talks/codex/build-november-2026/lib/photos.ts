// Every picture and video clip in ./photos, grouped by its folder.
//
// To add pictures to an event, put the files into its folder and reload the deck. Today's pictures
// go into photos/07-today (see "Add today's pictures" in the README). Files are shown in the order
// of their names.
const files = import.meta.glob(
  '../photos/*/*.{jpg,jpeg,png,webp,gif,mp4,webm,JPG,JPEG,PNG,WEBP,GIF,MP4,WEBM}',
  { eager: true, query: '?url', import: 'default' },
) as Record<string, string>

export interface Media {
  /** The address the browser loads. */
  url: string
  kind: 'image' | 'video'
}

const VIDEO_FILE = /\.(mp4|webm)$/i

/** The pictures and clips of one folder under ./photos, in file-name order. */
export function mediaIn(folder: string): Media[] {
  return Object.keys(files)
    .filter(path => path.startsWith(`../photos/${folder}/`))
    .sort()
    .map(path => ({ url: files[path], kind: VIDEO_FILE.test(path) ? 'video' : 'image' }))
}

/** Only the pictures of one folder, without video clips. */
export function picturesIn(folder: string): Media[] {
  return mediaIn(folder).filter(media => media.kind === 'image')
}

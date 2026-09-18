export type BasketSourceType = 'wholesaler' | 'tag';

export type TagFrameContext = {
  tagId: number;

  sellerId: number;

  bucketId: number;
};

export type OpenTagFramePayload = {
  frameId: number;

  frameBucketId: number;

  tagId: number;

  sellerId: number;

  bucketId: number;
};

export type StoredTagFrameContext = TagFrameContext & {
  wholesalerId: number;
  frameId: number;
};

export const TAG_FRAME_SESSION_KEY = 'zarhub_tag_frame_context';

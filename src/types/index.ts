export interface PositionConfig {
  imagePosition: {
    top: string;
    left: string;
    width: string;
    height: string;
  } | null;
  namePosition: {
    top: string;
    left: string;
    width: string;
    textAlign: string;
    color: string;
  } | null;
}

export interface Template {
  id: string;
  name: string;
  textOnlyImage: string;
  imageAndTextImage: string;
  textOnlyConfig: PositionConfig;
  imageAndTextConfig: PositionConfig;
  imageShape: 'circle' | 'square' | 'rounded';
  aspectRatio: number;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface CardData {
  id: string;
  name: string;
  image_url: string | null;
  template: string;
  created_at: string;
}

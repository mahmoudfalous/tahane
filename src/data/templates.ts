import 'server-only';

import fs from 'fs';
import path from 'path';
import { imageSize } from 'image-size';
import type { PositionConfig, Template } from '@/types';

type RawPlaceholder = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type RawTemplateConfig = {
  placeholders?: RawPlaceholder[];
};

const DEFAULT_DIMENSIONS = { width: 640, height: 800 };

function toDisplayName(name: string) {
  const templateNumber = name.match(/\d+/)?.[0];
  return templateNumber ? `تصميم ${templateNumber}` : 'تصميم تهاني';
}

function parseConfig(
  config: RawTemplateConfig | null,
  imageWidth: number,
  imageHeight: number,
): PositionConfig {
  if (!config?.placeholders) {
    return { imagePosition: null, namePosition: null };
  }

  const imagePlaceholder = config.placeholders.find((p) => p.label === 'image');
  const namePlaceholder = config.placeholders.find((p) => p.label === 'name');

  return {
    imagePosition: imagePlaceholder
      ? {
          top: `${(imagePlaceholder.y / imageHeight) * 100}%`,
          left: `${(imagePlaceholder.x / imageWidth) * 100}%`,
          width: `${(imagePlaceholder.width / imageWidth) * 100}%`,
          height: `${(imagePlaceholder.height / imageHeight) * 100}%`,
        }
      : null,
    namePosition: namePlaceholder
      ? {
          top: `${(namePlaceholder.y / imageHeight) * 100}%`,
          left: `${(namePlaceholder.x / imageWidth) * 100}%`,
          width: `${(namePlaceholder.width / imageWidth) * 100}%`,
          textAlign: 'center',
          color: '#000',
        }
      : null,
  };
}

function getImageDimensions(absoluteImagePath: string) {
  try {
    const parsedSize = imageSize(fs.readFileSync(absoluteImagePath));
    if (parsedSize.width && parsedSize.height) {
      return { width: parsedSize.width, height: parsedSize.height };
    }
  } catch {
    console.warn('تعذرت قراءة أبعاد الصورة', absoluteImagePath);
  }

  return DEFAULT_DIMENSIONS;
}

function loadConfig(cleanFileName: string): RawTemplateConfig | null {
  try {
    const configPath = path.join(process.cwd(), 'src', 'data', `${cleanFileName}_config.json`);
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8')) as RawTemplateConfig;
    }
  } catch {
    console.error(`تعذر تحميل إعدادات ${cleanFileName}`);
  }

  return null;
}

export function getTemplates(): Template[] {
  const templatesDir = path.join(process.cwd(), 'public', 'templates');
  const files = fs.readdirSync(templatesDir);
  const map: Record<string, Partial<Template>> = {};

  files.forEach((file) => {
    if (!/\.(png|webp|jpg|jpeg)$/i.test(file)) return;

    const absoluteImagePath = path.join(templatesDir, file);
    const dims = getImageDimensions(absoluteImagePath);
    const clean = file.replace(/\.(png|webp|jpg|jpeg)$/i, '');
    let id = clean;
    let type: 'textOnly' | 'imageAndText' | 'both' = 'both';

    if (clean.endsWith('_text')) {
      id = clean.replace('_text', '');
      type = 'textOnly';
    } else if (clean.endsWith('_image&text') || clean.includes('&text')) {
      id = clean.replace('_image&text', '').replace('&text', '');
      type = 'imageAndText';
    }

    if (!map[id]) {
      map[id] = {
        id,
        name: toDisplayName(id),
        textOnlyImage: '',
        imageAndTextImage: '',
        imageShape: 'circle',
        aspectRatio: dims.width / dims.height,
        colors: { primary: '#D4AF37', secondary: '#151A22' },
        textOnlyConfig: { imagePosition: null, namePosition: null },
        imageAndTextConfig: { imagePosition: null, namePosition: null },
      };
    }

    const publicPath = `/templates/${file}`;
    const parsedConfig = parseConfig(loadConfig(clean), dims.width, dims.height);

    if (type === 'textOnly') {
      map[id].textOnlyImage = publicPath;
      map[id].textOnlyConfig = parsedConfig;
      map[id].aspectRatio = dims.width / dims.height;
    } else if (type === 'imageAndText') {
      map[id].imageAndTextImage = publicPath;
      map[id].imageAndTextConfig = parsedConfig;
      map[id].aspectRatio = dims.width / dims.height;
    } else {
      map[id].textOnlyImage = publicPath;
      map[id].imageAndTextImage = publicPath;
      map[id].textOnlyConfig = parsedConfig;
      map[id].imageAndTextConfig = parsedConfig;
      map[id].aspectRatio = dims.width / dims.height;
    }
  });

  Object.values(map).forEach((template) => {
    if (!template.textOnlyImage && template.imageAndTextImage) {
      template.textOnlyImage = template.imageAndTextImage;
      template.textOnlyConfig = template.imageAndTextConfig;
    } else if (!template.imageAndTextImage && template.textOnlyImage) {
      template.imageAndTextImage = template.textOnlyImage;
      template.imageAndTextConfig = template.textOnlyConfig;
    }
  });

  return Object.values(map) as Template[];
}

export const templates = getTemplates();

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  WidthType,
  AlignmentType,
  VerticalAlign,
  TextRun,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';
import { ImageData } from '@/types';

const FIXED_IMAGE_WIDTH = 285;
const FIXED_IMAGE_HEIGHT = 198;

export async function generateNormalModeDocx(
  images: ImageData[],
  fileName: string = 'Marine_Cargo_Report'
): Promise<void> {
  try {
    console.log(`📄 Generating DOCX with ${images.length} images...`);
    
    const tableRows: TableRow[] = [];
    
    for (let i = 0; i < images.length; i += 2) {
      const leftImage = images[i];
      const rightImage = images[i + 1];
      
      console.log(`Processing pair: Image ${i + 1}${rightImage ? ` and ${i + 2}` : ''}`);
      
      const imageRow = await createImageRow(leftImage, rightImage);
      tableRows.push(imageRow);
      
      const descRow = createDescriptionRow(
        leftImage?.description || '',
        rightImage?.description || ''
      );
      tableRows.push(descRow);
    }
    
    console.log(`✓ Created ${tableRows.length} table rows`);
    
    const table = new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [5000, 5000],
      borders: {
        top: { style: 'none', size: 0, color: 'FFFFFF' },
        bottom: { style: 'none', size: 0, color: 'FFFFFF' },
        left: { style: 'none', size: 0, color: 'FFFFFF' },
        right: { style: 'none', size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: 'none', size: 0, color: 'FFFFFF' },
        insideVertical: { style: 'none', size: 0, color: 'FFFFFF' },
      },
    });
    
    const doc = new Document({
      sections: [{
        children: [table],
      }],
    });
    
    console.log('✓ Document structure created');
    
    const blob = await Packer.toBlob(doc);
    console.log(`✓ Blob generated: ${blob.size} bytes`);
    
    saveAs(blob, `${fileName}.docx`);
    console.log('✅ DOCX downloaded successfully!');
    
  } catch (error) {
    console.error('❌ DOCX generation failed:', error);
    throw error;
  }
}

async function createImageRow(left: ImageData, right: ImageData | null): Promise<TableRow> {
  const cells: TableCell[] = [];
  
  cells.push(await createImageCell(left));
  
  if (right) {
    cells.push(await createImageCell(right));
  } else {
    cells.push(createEmptyCell());
  }
  
  return new TableRow({ children: cells });
}

function createDescriptionRow(leftDesc: string, rightDesc: string): TableRow {
  const cells: TableCell[] = [
    createTextCell(leftDesc),
    createTextCell(rightDesc),
  ];
  
  return new TableRow({ children: cells });
}

async function createImageCell(imageData: ImageData): Promise<TableCell> {
  try {
    if (!imageData.processedBlob) {
      throw new Error('No processed blob');
    }
    
    const arrayBuffer = await imageData.processedBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log(`  ✓ Image ready: ${uint8Array.length} bytes`);
    
    const image = new ImageRun({
      data: uint8Array,
      transformation: {
        width: FIXED_IMAGE_WIDTH,
        height: FIXED_IMAGE_HEIGHT,
      },
    });
    
    return new TableCell({
      children: [
        new Paragraph({
          children: [image],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 5,
            after: 5,
          },
        }),
      ],
      width: { size: 50, type: WidthType.PERCENTAGE },
      verticalAlign: VerticalAlign.CENTER,
      margins: {
        top: 5,
        bottom: 5,
        left: 0,
        right: 0,
      },
    });
    
  } catch (error) {
    console.error('❌ Image cell error:', error);
    return createEmptyCell();
  }
}

function createTextCell(text: string): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text || '',
            font: 'Arial',
            size: 22,
            color: '000000',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 5,
          after: 5,
        },
      }),
    ],
    width: { size: 50, type: WidthType.PERCENTAGE },
    margins: {
      top: 5,
      bottom: 5,
      left: 0,
      right: 0,
    },
  });
}

function createEmptyCell(): TableCell {
  return new TableCell({
    children: [new Paragraph('')],
    width: { size: 50, type: WidthType.PERCENTAGE },
    margins: {
      top: 5,
      bottom: 5,
      left: 0,
      right: 0,
    },
  });
}

export function generateFileName(prefix: string = 'Marine_Cargo_Report'): string {
  const date = new Date();
  const timestamp = date.toISOString().split('T')[0].replace(/-/g, '');
  const time = date.toTimeString().split(' ')[0].replace(/:/g, '');
  return `${prefix}_${timestamp}_${time}`;
}

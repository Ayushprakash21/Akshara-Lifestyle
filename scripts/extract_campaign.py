import fitz
import os

pdf_path = r"C:\Users\Ayush\Downloads\E-commerce catalogue images.pdf"
out_dir = r"d:\ANtigravity\Akshara-lifestyle\src\assets\images\campaign_rainbow"
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Total pages: {len(doc)}")

for i, page in enumerate(doc):
    # 1. Render page
    pix = page.get_pixmap(dpi=200)
    page_img_path = os.path.join(out_dir, f"page_{i+1}.jpg")
    pix.save(page_img_path)
    print(f"Saved {page_img_path} ({pix.width}x{pix.height})")
    
    # 2. Extract embedded images
    image_list = page.get_images(full=True)
    for img_idx, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        raw_path = os.path.join(out_dir, f"raw_page_{i+1}_img_{img_idx+1}.{image_ext}")
        with open(raw_path, "wb") as f:
            f.write(image_bytes)
        print(f"  Extracted raw {raw_path} ({base_image['width']}x{base_image['height']})")

print("Done extracting!")

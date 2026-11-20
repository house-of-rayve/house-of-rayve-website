// Product page details from the RAYVE product sheet ("Rayve 3 product details"): the full specification list and
// care notes for each frame, keyed by slug. Frames without an entry fall back to the fields stored on the product.

const CARE = [
  "Clean gently using a soft microfiber cloth to maintain lens clarity.",
  "Store in the protective case when not in use to prevent scratches and damage.",
  "Avoid exposure to excessive heat, harsh chemicals and abrasive surfaces.",
  "Handle with both hands to maintain the frame’s original shape and alignment.",
];

export const PRODUCT_DETAILS = {
  nobel: {
    specs: [
      ["Frame material", "Metal"],
      ["Lens material", "Polycarbonate (PC)"],
      ["Fit", "Unisex"],
      ["Weight", "27.3 g"],
      ["Frame width", "138 mm"],
      ["Lens width", "52 mm"],
      ["Lens height", "34 mm"],
      ["Bridge width", "19 mm"],
      ["Temple length", "140 mm"],
    ],
    care: CARE,
  },
  fiero: {
    specs: [
      ["Frame shape", "Rectangle (rimless)"],
      ["Lens type", "UV400 (blocks 100% UVA & UVB)"],
      ["Hinges", "Spring hinges"],
      ["Fit", "Medium"],
      ["Weight", "30 g"],
      ["Suits face shapes", "Round, oval and heart"],
      ["Lens width", "57 mm"],
      ["Lens height", "38.5 mm"],
      ["Bridge width", "17 mm"],
      ["Temple length", "140 mm"],
    ],
    care: [...CARE.slice(0, 3), "Handle with both hands and avoid applying pressure directly to the rimless lenses."],
  },
  bravo: {
    specs: [
      ["Frame material", "PC + CP"],
      ["Frame shape", "Geometric (full rim)"],
      ["Lens material", "Polycarbonate (PC)"],
      ["Lens type", "UV400 protection"],
      ["Lens features", "Scratch resistance & clear vision"],
      ["Fit", "Unisex"],
      ["Weight", "38.5 g"],
      ["Frame width", "146 mm"],
      ["Lens width", "51 mm"],
      ["Lens height", "47 mm"],
      ["Bridge width", "21 mm"],
      ["Temple length", "147 mm"],
    ],
    care: CARE,
  },
};

export const CARE_INTRO = "Keep your RAYVE frames looking their best with a little everyday care.";

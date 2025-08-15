import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

type Mode = "create" | "edit";
type Collection = "DISH" | "DRINK" | "DESSERT" | "SALAD";
type Size = "SMALL" | "NORMAL" | "LARGE" | "SET";
type Volume = 0.5 | 1 | 1.25 | 1.5;

export type ProductInitialValues = {
  _id?: string; // need for edit
  productName: string;
  productPrice: number;
  productLeftCount: number;
  productCollection: Collection;
  productSize?: Size;
  productVolume?: Volume;
  productDesc: string;
  productImages: string[]; 
};

type Props = {
  mode: Mode;
  open: boolean;
  onClose: () => void;
  onSubmit: (fd: FormData, id?: string) => void; // id passed in edit
  initialValues?: ProductInitialValues; // required for edit
};

type FormValues = {
  productName: string;
  productPrice: string; 
  productLeftCount: string;
  productCollection: Collection;
  productSize?: Size;
  productVolume?: Volume;
  productDesc: string;
  existingUrls: string[]; // for edit
  newFiles: File[]; // new uploads
};

const EMPTY: FormValues = {
  productName: "",
  productPrice: "",
  productLeftCount: "",
  productCollection: "DISH",
  productSize: "NORMAL",
  productVolume: undefined,
  productDesc: "",
  existingUrls: [],
  newFiles: [],
};

const SLOT_COUNT = 5;
const sizeOptions: Size[] = ["SMALL", "NORMAL", "LARGE", "SET"];
const volumeOptions: Volume[] = [0.5, 1, 1.25, 1.5];

export default function ProductDialog({
  mode,
  open,
  onClose,
  onSubmit,
  initialValues,
}: Props) {
  const [form, setForm] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const isDrink = form.productCollection === "DRINK";

  // Prefill on open (edit) or reset (create)
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialValues) {
      setForm({
        productName: initialValues.productName ?? "",
        productPrice: String(initialValues.productPrice ?? ""),
        productLeftCount: String(initialValues.productLeftCount ?? ""),
        productCollection: initialValues.productCollection ?? "DISH",
        productSize: initialValues.productSize,
        productVolume: initialValues.productVolume,
        productDesc: initialValues.productDesc ?? "",
        existingUrls: initialValues.productImages ?? [],
        newFiles: [],
      });
      setErrors({});
    } else {
      setForm(EMPTY);
      setErrors({});
    }
  }, [open, mode, initialValues]);

  const previews: string[] = useMemo(() => {
    const fileUrls = form.newFiles.map((f) => URL.createObjectURL(f));
    return [...form.existingUrls, ...fileUrls].slice(0, SLOT_COUNT);
  }, [form.existingUrls, form.newFiles]);

  const canSubmit = useMemo(() => {
    const okBase =
      form.productName.trim() &&
      form.productPrice.trim() &&
      !Number.isNaN(Number(form.productPrice)) &&
      Number(form.productPrice) >= 0 &&
      form.productLeftCount.trim() &&
      Number.isInteger(Number(form.productLeftCount)) &&
      Number(form.productLeftCount) >= 0 &&
      form.productDesc.trim() &&
      form.existingUrls.length + form.newFiles.length > 0;

    const okSpec = isDrink ? !!form.productVolume : !!form.productSize;
    return !!okBase && okSpec;
  }, [form, isDrink]);

  const setField =
    <K extends keyof FormValues>(k: K) =>
    (v: FormValues[K]) =>
      setForm((p) => ({ ...p, [k]: v }));

  const triggerPick = (slotIndex: number) =>
    inputsRef.current[slotIndex]?.click();

  const onFilePick = (slotIndex: number, f: File | null) => {
    if (!f) return;
    setForm((p) => {
      const used = p.existingUrls.length + p.newFiles.length;
      if (used >= SLOT_COUNT) return p;
      return { ...p, newFiles: [...p.newFiles, f] };
    });
  };

  // Remove (click an image): remove from existing first, then new files
  const removeAt = (slotIndex: number) => {
    const urlCount = form.existingUrls.length;
    if (slotIndex < urlCount) {
      setForm((p) => ({
        ...p,
        existingUrls: p.existingUrls.filter((_, i) => i !== slotIndex),
      }));
    } else {
      const fileIdx = slotIndex - urlCount;
      setForm((p) => ({
        ...p,
        newFiles: p.newFiles.filter((_, i) => i !== fileIdx),
      }));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.productName.trim()) e.productName = "Required";
    if (!form.productPrice || Number.isNaN(Number(form.productPrice)))
      e.productPrice = "Invalid";
    if (
      !form.productLeftCount ||
      Number.isNaN(Number(form.productLeftCount)) ||
      !Number.isInteger(Number(form.productLeftCount))
    )
      e.productLeftCount = "Integer only";
    if (!form.productDesc.trim()) e.productDesc = "Required";
    if (form.existingUrls.length + form.newFiles.length === 0)
      e.productImages = "At least one image";
    if (isDrink ? !form.productVolume : !form.productSize) e.spec = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    const fd = new FormData();
    fd.append("productName", form.productName.trim());
    fd.append("productPrice", String(Number(form.productPrice)));
    fd.append("productLeftCount", String(Number(form.productLeftCount)));
    fd.append("productCollection", form.productCollection);
    if (isDrink) fd.append("productVolume", String(form.productVolume));
    else fd.append("productSize", String(form.productSize));
    fd.append("productDesc", form.productDesc.trim());

    // EDIT: keep existing urls; CREATE: none (array empty)
    form.existingUrls.forEach((u) => fd.append("existingImages[]", u));
    // upload new files
    form.newFiles.forEach((f) => fd.append("productImages", f));

    const id = mode === "edit" ? initialValues?._id : undefined;
    onSubmit(fd, id);
    onClose();
  };

  return (
    <Dialog
      className="dialog"
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: 700,
          letterSpacing: 1,
          fontSize: "24px",
        }}
      >
        {mode === "create" ? "New Product Detail" : "Edit Product"}
      </DialogTitle>

      <DialogContent dividers sx={{ background: "#f8f8ff", py: 3 }}>
        <Box sx={{ maxWidth: 980, mx: "auto" }}>
          <Grid container spacing={3}>
            {/* Name */}
            <Grid item xs={12}>
              <Typography className="sub-title">Product Name</Typography>
              <TextField
                fullWidth
                placeholder="Name"
                value={form.productName}
                onChange={(e) => setField("productName")(e.target.value)}
                error={!!errors.productName}
                helperText={errors.productName}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Price / Left Count */}
            <Grid item xs={12} md={6}>
              <Typography className="sub-title">Product Price</Typography>
              <TextField
                fullWidth
                placeholder="Price"
                type="number"
                value={form.productPrice}
                onChange={(e) => setField("productPrice")(e.target.value)}
                error={!!errors.productPrice}
                helperText={errors.productPrice}
                inputProps={{ min: 0, step: "0.01" }}
                sx={{ bgcolor: "white" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography className="sub-title">Product Left Counts</Typography>
              <TextField
                fullWidth
                placeholder="Counts"
                type="number"
                value={form.productLeftCount}
                onChange={(e) => setField("productLeftCount")(e.target.value)}
                error={!!errors.productLeftCount}
                helperText={errors.productLeftCount}
                inputProps={{ min: 0, step: 1 }}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Collection / Size or Volume */}
            <Grid item xs={12} md={6}>
              <Typography className="sub-title">Product Type</Typography>
              <FormControl fullWidth sx={{ bgcolor: "white" }}>
                <Select
                  value={form.productCollection}
                  onChange={(e) => {
                    const val = e.target.value as Collection;
                    setForm((p) => ({
                      ...p,
                      productCollection: val,
                      productSize:
                        val === "DRINK" ? undefined : p.productSize ?? "NORMAL",
                      productVolume:
                        val === "DRINK" ? p.productVolume ?? 1 : undefined,
                    }));
                  }}
                  displayEmpty
                >
                  <MenuItem value="DISH">DISH</MenuItem>
                  <MenuItem value="DRINK">DRINK</MenuItem>
                  <MenuItem value="DESSERT">DESSERT</MenuItem>
                  <MenuItem value="SALAD">SALAD</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography className="sub-title">
                {isDrink ? "Dish Volume" : "Dish Size"}
              </Typography>
              <FormControl fullWidth sx={{ bgcolor: "white" }}>
                <Select
                  value={
                    isDrink ? form.productVolume ?? "" : form.productSize ?? ""
                  }
                  onChange={(e) => {
                    if (isDrink)
                      setField("productVolume")(
                        Number(e.target.value) as Volume
                      );
                    else setField("productSize")(e.target.value as Size);
                  }}
                  displayEmpty
                >
                  {isDrink
                    ? volumeOptions.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))
                    : sizeOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="error">
                {errors.spec}
              </Typography>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Typography className="sub-title">Product Description</Typography>
              <TextField
                fullWidth
                multiline
                minRows={6}
                value={form.productDesc}
                onChange={(e) => setField("productDesc")(e.target.value)}
                error={!!errors.productDesc}
                helperText={errors.productDesc}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            {/* Images (5 slots) */}
            <Grid item xs={12}>
              <Typography className="sub-title">Product Images</Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  mt: "5px",
                }}
              >
                {Array.from({ length: SLOT_COUNT }).map((_, i) => {
                  const src = previews[i] || null;
                  return (
                    <Box
                      key={i}
                      onClick={() => (src ? removeAt(i) : triggerPick(i))}
                      className="images"
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 4,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "rgba(255,255,255,0.35)",
                        boxShadow: 1,
                      }}
                      title={src ? "Click to remove" : "Click to add image"}
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <CloudUploadOutlinedIcon
                          sx={{ fontSize: 80, color: "#b197fc" }}
                        />
                      )}
                      <input
                        ref={(el) => (inputsRef.current[i] = el)}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) =>
                          onFilePick(i, e.target.files?.[0] ?? null)
                        }
                      />
                    </Box>
                  );
                })}
              </Box>
              {errors.productImages && (
                <Typography variant="caption" color="error">
                  {errors.productImages}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="error" variant="contained" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={submit}
          disabled={!canSubmit}
        >
          {mode === "create" ? "Create" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

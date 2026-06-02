import { useEffect, useState } from "react";
import type { GISFeature } from "../../types/feature";
import { createPortal } from "react-dom";

/* ---------------- PROPS ---------------- */
type Props = {
  feature: GISFeature | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (feature: GISFeature) => void;
  onDelete: (id: string) => void;
};

/* ---------------- UI STATE ---------------- */
type FeatureFormState = {
  title: string;
  description: string;

  status: "Nieuw" | "In uitvoering" | "Afgerond";
  priority: "Laag" | "Normaal" | "Hoog" | "Kritisch";
  category: string;

  address: string;
  date: string;
  user: string;

  bag: boolean;
  bgt: boolean;
  overbouw: boolean;

  bagCategory?: string;
  bgtCategory?: string;

  images: string[];
};

/* ---------------- COMPONENT ---------------- */
export default function FeatureForm({
  feature,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<FeatureFormState>({
    title: "",
    description: "",
    status: "Nieuw",
    priority: "Laag",
    category: "Melding",

    address: "",
    date: "",
    user: "",

    bag: false,
    bgt: false,
    overbouw: false,

    images: [],
  });

  /* ---------------- HYDRATE ---------------- */
  useEffect(() => {
    if (!feature) return;

    const ui = feature.properties.ui;

    setForm({
      title: ui?.title ?? "",
      description: ui?.description ?? "",
      status: ui?.status ?? "Nieuw",
      priority:
        ui?.priority === "Low"
          ? "Laag"
          : ui?.priority === "High"
            ? "Hoog"
            : ui?.priority === "Critical"
              ? "Kritisch"
              : "Normaal",

      category: ui?.category ?? "Melding",

      address: ui?.address ?? feature.properties.address ?? "",
      date: ui?.date ?? new Date().toLocaleDateString("nl-NL"),
      user: ui?.user ?? "Digireg1",

      bag: feature.properties.bag ?? false,
      bgt: feature.properties.bgt ?? false,
      overbouw: feature.properties.overbouw ?? false,

      bagCategory: feature.properties.bagCategory,
      bgtCategory: feature.properties.bgtCategory,

      images: feature.properties.images ?? [],
    });
  }, [feature?.id]);

  if (!feature) return null;

  /* ---------------- UPDATE ---------------- */
  const update = <K extends keyof FeatureFormState>(
    key: K,
    value: FeatureFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ---------------- IMAGE UPLOAD ---------------- */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers = Array.from(files).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((imgs) => {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...imgs],
      }));
    });
  };

  /* ---------------- SAVE ---------------- */
  const mapPriorityToGIS = (
    p: FeatureFormState["priority"],
  ): "Low" | "Medium" | "High" | "Critical" => {
    switch (p) {
      case "Laag":
        return "Low";
      case "Normaal":
        return "Medium";
      case "Hoog":
        return "High";
      case "Kritisch":
        return "Critical";
      default:
        return "Medium";
    }
  };

  const handleSave = () => {
    if (!feature) return;

    const updated: GISFeature = {
      ...feature,
      properties: {
        ...feature.properties,

        ui: {
          title: form.title,
          description: form.description,
          status: form.status,
          priority: mapPriorityToGIS(form.priority),
          category: form.category,
          address: form.address,
          date: form.date,
          user: form.user,
        },

        // GIS DATA (REAL WORLD)
        bag: form.bag,
        bgt: form.bgt,
        overbouw: form.overbouw,
        bagCategory: form.bagCategory,
        bgtCategory: form.bgtCategory,
      },
    };

    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    onDelete(feature.id);
    onClose();
  };

  const toggle = (key: "bag" | "bgt" | "overbouw") => {
    setForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const chip = (active: boolean) =>
    `px-3 py-1 rounded border cursor-pointer transition ${
      active ? "bg-blue-600 text-white border-blue-600" : "hover:bg-red-100"
    }`;

  /* ---------------- UI ---------------- */
  if (!feature) return null;

  return createPortal(
    <div
      className={`fixed top-0 right-0 h-screen w-[420px] bg-white shadow-2xl z-[9999]
    transform transition-transform duration-300 ease-in-out flex flex-col
    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* HEADER */}
      <div className="p-4 border-b flex justify-between">
        <h2 className="font-bold text-lg">Melding</h2>
      </div>

      {/* BODY */}
      <div className="p-4 flex-1 overflow-auto space-y-4 ">
        {/* META (READ ONLY) */}
        <div className="text-sm border-b pb-2">
          <a className="font-bold text-blue-600"> Melder:</a> {form.user}
          <br />
          <a className="font-bold text-blue-600">Datum:</a> {form.date}
          <br />
          <a className="font-bold text-blue-600">Adres:</a> {form.address}
        </div>

        {/* TITLE */}
        <div>
          <div className="text-lg">Betreft</div>
          <input
            className="w-full border p-2 rounded"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Title"
          />
        </div>

        {/* PRIORITEIT */}
        <div>
          <div className="text-lg">Prioriteit</div>
          <select
            value={form.priority}
            onChange={(e) =>
              update("priority", e.target.value as FeatureFormState["priority"])
            }
            className="w-full border p-2 rounded"
          >
            <option value="Laag">Laag</option>
            <option value="Normaal">Normaal</option>
            <option value="Hoog">Hoog</option>
            <option value="Kritisch">Kritisch</option>
          </select>
        </div>

        {/* TOGGLES */}
        <div className="flex gap-2">
          <button onClick={() => toggle("bag")} className={chip(form.bag)}>
            BAG
          </button>

          <button onClick={() => toggle("bgt")} className={chip(form.bgt)}>
            BGT
          </button>

          <button
            onClick={() => toggle("overbouw")}
            className={chip(form.overbouw)}
          >
            Overbouw
          </button>
        </div>
        <div className="text-xs text-gray-400">
          BAG: {String(form.bag)} | BGT: {String(form.bgt)}
        </div>

        <div>
          {form.bag && (
            <select
              className={`px-1 py-1 rounded border`}
              value={form.bagCategory ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, bagCategory: e.target.value }))
              }
            >
              <option value="">Select BAG category</option>
              <option value="pand">Pand</option>
              <option value="verblijfsobject">Verblijfsobject</option>
              <option value="ligplaats">Ligplaats</option>
            </select>
          )}
        </div>

        <div>
          {form.bgt && (
            <select
              className={`px-1 py-1 rounded border`}
              value={form.bgtCategory ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, bgtCategory: e.target.value }))
              }
            >
              <option value="">Select BGT category</option>
              <option value="wegdeel">Wegdeel</option>
              <option value="onbegroeidterreindeel">
                OnbegroeidTerreindeel
              </option>
              <option value="overbruggingsdeel">Overbruggingsdeel</option>
              <option value="waterdeel">Waterdeel</option>
              <option value="waterinrichtingselement">
                Waterinrichtingselement
              </option>
              <option value="begroeidterreindeel">BegroeidTerreindeel</option>
              <option value="scheiding">scheiding</option>
              <option value="pand">Pand</option>
              <option value="gebouwinstallatie">Gebouwinstallatie</option>
              <option value="kunstwerkdeel">Kunstwerkdeel</option>
              <option value="overigBouwwerk">OverigBouwwerk</option>
            </select>
          )}
        </div>

        {/* DESCRIPTION (MOVED DOWN) */}
        <textarea
          className="w-full border p-2 rounded min-h-[100px]"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Description"
        />

        {/* IMAGE UPLOAD */}
        <div className="space-y-3">
          {/* Upload Label */}
          <label className="block text-sm font-semibold text-gray-700">
            Foto's Uploaden
          </label>

          {/* Upload Box */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <span className="text-3xl">📷</span>
              <p className="text-sm font-medium mt-1">
                Klik om foto's te uploaden
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, JPEG</p>
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {/* Preview Grid */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className="relative group rounded-lg overflow-hidden border shadow-sm"
                >
                  <img
                    src={img}
                    alt={`Upload ${i + 1}`}
                    className="w-full h-24 object-cover"
                  />

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "images",
                        form.images.filter((_, index) => index !== i),
                      )
                    }
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t flex gap-2">
        <button onClick={onClose} className="flex-1 border p-2 rounded">
          Cancel
        </button>

        {/* only show delete when feature exists */}
        {feature?.id && (
          <button
            onClick={handleDelete}
            className="flex-1 bg-red-600 text-white p-2 rounded"
          >
            Delete
          </button>
        )}

        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white p-2 rounded"
        >
          Save
        </button>
      </div>
    </div>,
    document.body,
  );
}

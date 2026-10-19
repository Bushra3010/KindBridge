import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { adminSaveCategory } from "@/app/actions";
import { ActionForm, Submit } from "@/components/forms";
import { Icon, type IconName } from "@/components/icons";
import { CATEGORY_ICON, Note, categoryIcon } from "@/components/ui";

export const metadata = { title: "Skill categories" };

const ICONS = [...new Set<IconName>([...Object.values(CATEGORY_ICON), "sparkle", "heart", "award", "file", "image", "megaphone"])];

type C = { id?: string; name?: string; slug?: string; icon?: string; maxCoins?: number; active?: boolean };

function CategoryForm({ c }: { c: C }) {
  const f = (name: string) => `${c.id ?? "new"}-${name}`;
  return (
    <ActionForm action={adminSaveCategory} resetOnSuccess={!c.id} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={c.id ?? ""} />
      <div className="min-w-40 flex-1"><label className="label" htmlFor={f("name")}>Name</label><input id={f("name")} name="name" required defaultValue={c.name} className="field py-2" /></div>
      <div className="w-36"><label className="label" htmlFor={f("slug")}>Slug</label><input id={f("slug")} name="slug" required defaultValue={c.slug} pattern="[a-z0-9-]{2,40}" className="field py-2" /></div>
      <div className="w-36">
        <label className="label" htmlFor={f("icon")}>Icon</label>
        <select id={f("icon")} name="icon" defaultValue={c.icon ?? "sparkle"} className="field py-2">{ICONS.map((i) => <option key={i}>{i}</option>)}</select>
      </div>
      <div className="w-28"><label className="label" htmlFor={f("maxCoins")}>Coin ceiling</label><input id={f("maxCoins")} name="maxCoins" type="number" min={1} max={500} required defaultValue={c.maxCoins ?? 40} className="field py-2" /></div>
      <label className="flex items-center gap-2 py-2 text-[14px] font-semibold"><input type="checkbox" name="active" defaultChecked={c.active ?? true} className="size-4 accent-teal-700" /> Active</label>
      <Submit className="btn-primary btn-sm">{c.id ? "Save" : "Add"}</Submit>
    </ActionForm>
  );
}

export default async function AdminCategories() {
  await requireRole(["ADMIN"]);
  const cats = await db.skillCategory.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { listings: { where: { status: "OPEN" } }, skills: true } } } });

  return (
    <div className="space-y-3">
      <Note icon="info">Categories drive listings, request matching and the per-listing coin ceiling. Deactivating one hides it from new listings and onboarding; existing listings keep it.</Note>
      {cats.map((c) => (
        <section key={c.id} className={`card p-4 ${c.active ? "" : "opacity-70"}`}>
          <p className="mb-2 flex items-center gap-2 font-extrabold">
            <Icon name={categoryIcon(c)} size={18} /> {c.name}
            <span className="text-[13px] font-semibold text-muted">· {c._count.listings} open listings · {c._count.skills} member skills{c.active ? "" : " · inactive"}</span>
          </p>
          <CategoryForm c={c} />
        </section>
      ))}
      <section className="card p-4">
        <p className="mb-2 font-extrabold text-teal-700">+ New category</p>
        <CategoryForm c={{}} />
      </section>
    </div>
  );
}

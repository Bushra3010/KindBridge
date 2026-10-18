import { Icon } from "./icons";
import { CATEGORY_ICON } from "./ui";

type Cat = { id: string; slug: string; name: string };

export function SkillChips({ name, categories, selected }: { name: string; categories: Cat[]; selected: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((c) => (
        <span key={c.id}>
          <input type="checkbox" name={name} value={c.id} id={`${name}-${c.id}`} defaultChecked={selected.includes(c.id)} className="peer-chip sr-only" />
          <label htmlFor={`${name}-${c.id}`} className="chip w-full cursor-pointer justify-start py-2.5">
            <Icon name={CATEGORY_ICON[c.slug] ?? "sparkle"} size={18} /> {c.name}
          </label>
        </span>
      ))}
    </div>
  );
}

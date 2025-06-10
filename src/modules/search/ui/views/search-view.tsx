import { CategoriesSection } from "../sections/categories-section";

interface PageProps {
        query: string | undefined;
        categoryId: string | undefined;
}

export const SearchView = ({ query, categoryId }: PageProps) => {
    return (
        <div className="mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
            <CategoriesSection categoryId={categoryId} />
        </div>
    )
}
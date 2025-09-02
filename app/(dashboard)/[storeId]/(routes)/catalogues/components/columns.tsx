"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type CatalogueColumn = {
    id: string
    label: string
    isArchived: boolean
    isFeatured: boolean
    createdAt: string;
}

export const columns: ColumnDef<CatalogueColumn>[] = [
    {
        accessorKey: "label",
        header: "Label",
    },
    {
        accessorKey: "createdAt",
        header: "Date",
    },
    {
        accessorKey: "isArchived",
        header: "Archived",
    },
    {
        accessorKey: "isFeatured",
        header: "Featured",
    },
    {
        id: "actions",
        cell: ({ row }) => <CellAction data={row.original} />
    }
]
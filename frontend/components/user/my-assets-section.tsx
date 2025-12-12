"use client"

import { useState } from "react"
import { DataTable } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { Modal } from "@/components/shared/modal"
import { AssetForm } from "@/components/forms/asset-form"
import { Badge } from "@/components/ui/badge"
import { PackageIcon } from "@/components/icons"
import { useAssets } from "@/hooks/use-assets"
import { useCategories } from "@/hooks/use-categories"
import { useDepartments } from "@/hooks/use-departments"
import { useRegisterWarranty } from "@/hooks/use-register-warranty"
import { useAuthContext } from "@/contexts/auth-context"
import type { Asset } from "@/types"

export function MyAssetsSection() {
  const { user } = useAuthContext()
  const { assets, createAsset } = useAssets(user?.id)
  const { categories } = useCategories()
  const { departments } = useDepartments()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [registeredWarrantyId, setRegisteredWarrantyId] = useState<string | null>(null)
  const [assetStates, setAssetStates] = useState<Record<string, { isLoading: boolean; isSuccess: boolean; error: string | null }>>({})

  const { mutate: registerWarranty } = useRegisterWarranty()

  const myAssets = assets.filter((a) => a.createdBy === user?.id)
  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name || "Unknown"
  const getDepartmentName = (id: string) => departments.find((d) => d.id === id)?.name || "Unknown"

  const handleRegisterWarranty = (asset: Asset) => {
    if (!user?.id) return

    setAssetStates(prev => ({ ...prev, [asset.id]: { isLoading: true, isSuccess: false, error: null } }))

    registerWarranty(
      {
        asset_id: asset.id,
        asset_name: asset.name,
        user_id: user.id,
      },
      {
        onSuccess: () => {
          setRegisteredWarrantyId(asset.id)
          setAssetStates(prev => ({ ...prev, [asset.id]: { isLoading: false, isSuccess: true, error: null } }))
        },
        onError: (error: any) => {
          const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to register warranty'
          setAssetStates(prev => ({ ...prev, [asset.id]: { isLoading: false, isSuccess: false, error: errorMsg } }))
        }
      }
    )
  }

  const columns = [
    {
      key: "name" as keyof Asset,
      label: "Asset",
      render: (item: Asset) => <AssetCell name={item.name} category={getCategoryName(item.categoryId)} />,
    },
    {
      key: "departmentId",
      label: "Department",
      render: (item: Asset) => <Badge variant="outline">{getDepartmentName(item.departmentId)}</Badge>,
    },
    {
      key: "cost",
      label: "Cost",
      render: (item: Asset) => <span className="font-semibold">${item.cost.toLocaleString()}</span>,
    },
    {
      key: "datePurchased",
      label: "Purchased",
      render: (item: Asset) => new Date(item.datePurchased).toLocaleDateString(),
    },
    {
      key: "warranty",
      label: "Warranty",
      render: (item: Asset) => {
        const state = assetStates[item.id] || { isLoading: false, isSuccess: false, error: null }
        const isRegistered = registeredWarrantyId === item.id || item.warrantyRegistered

        if (isRegistered) {
          return <Badge className="bg-green-100 text-green-800">Warranty Registered</Badge>
        }

        return (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleRegisterWarranty(item)}
              disabled={state.isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isLoading ? "Registering..." : "Register Warranty"}
            </button>
            {state.error && <span className="text-xs text-red-600">{state.error}</span>}
          </div>
        )
      },
    },
  ]

  const handleCreate = async (data: Parameters<typeof createAsset>[0]) => {
    await createAsset(data)
    setIsModalOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="My Assets"
        description="View and manage your personal assets"
        actionLabel="Add Asset"
        onAction={() => setIsModalOpen(true)}
      />
      <DataTable data={myAssets} columns={columns} emptyMessage="You haven't created any assets yet" />
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Asset"
        description="Add a new asset to your inventory"
      >
        <AssetForm
          onSubmit={handleCreate}
          onCancel={() => setIsModalOpen(false)}
          categories={categories}
          departments={departments}
        />
      </Modal>
    </div>
  )
}

function AssetCell({ name, category }: { name: string; category: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <PackageIcon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{category}</p>
      </div>
    </div>
  )
}

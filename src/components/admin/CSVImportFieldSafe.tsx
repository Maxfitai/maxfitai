// src/components/admin/CSVImportFieldSafe.tsx
'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const CSVImportField = dynamic(
    () => import('./CSVImportField').then((mod) => mod.CSVImportField),
    {
        ssr: false,
        loading: () => (
            <div style={{ padding: '20px', border: '2px dashed #ccc', borderRadius: '8px', marginBottom: '20px', color: '#999' }}>
                Loading CSV importer...
            </div>
        ),
    }
)

// Cast to any so TypeScript doesn't complain about Payload's required props
const CSVImportFieldAny = CSVImportField as React.ComponentType<Record<string, unknown>>

export const CSVImportFieldSafe = () => {
    return <CSVImportFieldAny />
}
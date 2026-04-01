'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UIFieldClientComponent } from 'payload'

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export const CSVImportField: UIFieldClientComponent = () => {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [csvContent, setCsvContent] = useState('')
  const router = useRouter()

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setMessage('Please select a CSV file')
      return
    }
    const content = await file.text()
    setCsvContent(content)
    setMessage(`Loaded ${file.name} - Click "Import Recipes" to import`)
  }, [])

  const handleImport = useCallback(async () => {
    if (!csvContent.trim()) {
      setMessage('No CSV data to import')
      return
    }

    setIsLoading(true)
    setMessage('Importing recipes...')

    try {
      const lines = csvContent.split('\n').filter((line: string) => line.trim())
      const dataLines = lines.slice(1)
      let successCount = 0
      let errorCount = 0

      for (const line of dataLines) {
        try {
          const values = parseCSVLine(line)
          if (values.length < 4) continue

          const [
            title,
            category,
            ingredientsStr,
            prepMinutes,
            imgUrl,
            kcal,
            protein,
            carbs,
            fat,
            stepsStr,
            tagsStr,
          ] = values

          const ingredients = ingredientsStr
            ? ingredientsStr.split(/[,;]/).map((i: string) => ({ name: i.trim() }))
            : []
          const steps = stepsStr
            ? stepsStr.split(/[|;]/).map((s: string) => ({ step: s.trim() }))
            : []
          const tags = tagsStr ? tagsStr.split(/[,;]/).map((t: string) => ({ tag: t.trim() })) : []

          const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              title: title?.trim() || 'Untitled',
              category: category?.trim() || 'Quick & Easy Meals',
              ingredients,
              prep_minutes: parseInt(prepMinutes) || 0,
              imgUrl: imgUrl?.trim() || '',
              macros: {
                kcal: parseInt(kcal) || 0,
                protein: parseInt(protein) || 0,
                carbs: parseInt(carbs) || 0,
                fat: parseInt(fat) || 0,
              },
              steps,
              tags,
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (err) {
          console.error('Error creating recipe:', err)
          errorCount++
        }
      }

      setCsvContent('')
      alert(
        `Import complete! ${successCount} recipes imported successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
      )
      router.push('/admin/collections/recipes')
    } catch (err) {
      console.error('Import error:', err)
      setMessage('Failed to import recipes. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [csvContent, router])

  return (
    <div
      style={{
        padding: '20px',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <div style={{ marginBottom: '10px' }}>
        <strong>Bulk Import Recipes from CSV</strong>
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        style={{ marginBottom: '10px' }}
        disabled={isLoading}
      />
      {message && (
        <div
          style={{
            padding: '8px',
            backgroundColor:
              message.includes('Failed') || message.includes('failed') ? '#fee' : '#efe',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '10px',
          }}
        >
          {message}
        </div>
      )}
      <div style={{ marginTop: '10px' }}>
        <textarea
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder="Or paste CSV data here..."
          disabled={isLoading}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        />
      </div>
      <button
        type="button"
        onClick={handleImport}
        disabled={isLoading || !csvContent.trim()}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: isLoading || !csvContent.trim() ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !csvContent.trim() ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {isLoading ? 'Importing...' : 'Import Recipes'}
      </button>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        <strong>CSV Format:</strong>
        <br />
        title,category,ingredients,prep_minutes,imgUrl,kcal,protein,carbs,fat,steps,tags
      </div>
    </div>
  )
}

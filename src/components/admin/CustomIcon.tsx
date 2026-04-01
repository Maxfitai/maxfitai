'use client'

import React from 'react'

export const CustomIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      style={{ width: '24px', height: '24px' }}
    >
      <defs>
        <style>
          {`
            .icon-cls-1 { fill: #ccff0b; }
            .icon-cls-2 { fill: #fffdfa; }
          `}
        </style>
      </defs>
      {/* Simplified MaxFit M icon for breadcrumb */}
      <path
        className="icon-cls-1"
        d="M25,40 L25,60 L32,60 L32,45 L50,60 L68,45 L68,60 L75,60 L75,40 L68,40 L50,55 L32,40 Z"
      />
      <path
        className="icon-cls-2"
        d="M25,65 L25,75 L32,75 L32,68 L50,80 L68,68 L68,75 L75,75 L75,65 L68,65 L50,77 L32,65 Z"
      />
    </svg>
  )
}

'use client'

import React from 'react'
import NavBar from '../../components/general/NavBar'
import { Upload, MoreVertical, Download, FileText, Image, FileArchive } from "lucide-react";


const documents = [
    {
        name: "Lease Agreement",
        type: "PDF",
        size: "2.4 MB",
        date: "Jan 1, 2024",
        icon: FileText,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-50",
    },
    {
        name: "Move-in Inspection",
        type: "PDF",
        size: "1.8 MB",
        date: "Jan 5, 2024",
        icon: FileText,
        iconColor: "text-green-500",
        iconBg: "bg-green-50",
    },
    {
        name: "Property Photos",
        type: "ZIP",
        size: "12.5 MB",
        date: "Jan 3, 2024",
        icon: FileArchive,
        iconColor: "text-purple-500",
        iconBg: "bg-purple-50",
    },
];

const Documents = () => {
    return (
        <>
            <NavBar title="Documents" subtitle="View and manage documents" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                        <p className="text-sm text-gray-400">Manage lease agreements and important files</p>
                    </div>
                    <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Document
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {documents.map((doc, i) => {
                        const Icon = doc.icon;
                        return (
                            <div key={i} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${doc.iconBg} rounded-xl flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${doc.iconColor}`} />
                                    </div>
                                    <button className="text-gray-300 hover:text-gray-500 transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">{doc.name}</h3>
                                <p className="text-xs text-gray-400 mb-3">
                                    {doc.type} • {doc.size}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">{doc.date}</span>
                                    <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                                        <Download className="w-3 h-3" />
                                        Download
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}

export default Documents
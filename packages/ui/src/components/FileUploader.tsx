import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ProgressBar } from "./ProgressBar.js";

export interface PickedFile {
  name: string;
  uri: string;
  mimeType: string;
  sizeBytes: number;
}

export interface FileUploaderProps {
  onFilePicked: (file: PickedFile) => void;
  accept?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  uploading?: boolean;
  progress?: number;
  variant?: "image-only" | "document" | "any";
  label?: string;
}

export function FileUploader({
  onFilePicked: _onFilePicked,
  maxSizeMB = 10,
  uploading = false,
  progress = 0,
  variant = "any",
  label,
}: FileUploaderProps): React.JSX.Element {
  // Real file picking done in apps using expo-image-picker / expo-document-picker
  // This component handles UI state only
  // TODO: [PHASE-2] Apps wrap this with expo-document-picker in a local component

  const getLabel = () => {
    if (label) return label;
    if (variant === "image-only") return "Upload Image";
    if (variant === "document") return "Upload Document";
    return "Upload File";
  };

  const getHint = () => {
    const types =
      variant === "image-only"
        ? "JPEG, PNG"
        : variant === "document"
        ? "PDF, DOCX, PPTX"
        : "PDF, DOCX, JPEG, PNG";
    return `${types} • Max ${maxSizeMB}MB`;
  };

  return (
    <View>
      <TouchableOpacity
        style={{
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: uploading ? "#D1D5DB" : "#2E7DD1",
          borderRadius: 12,
          padding: 20,
          alignItems: "center",
          backgroundColor: uploading ? "#F9FAFB" : "#EFF6FF",
        }}
        disabled={uploading}
        accessibilityLabel={getLabel()}
        accessibilityRole="button"
      >
        <Text style={{ fontSize: 24, marginBottom: 4 }}>📎</Text>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#2E7DD1" }}>
          {uploading ? "Uploading..." : getLabel()}
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {getHint()}
        </Text>
      </TouchableOpacity>
      {uploading && (
        <View style={{ marginTop: 8 }}>
          <ProgressBar value={progress} max={100} showLabel />
        </View>
      )}
    </View>
  );
}

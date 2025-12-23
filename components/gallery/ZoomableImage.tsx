"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState } from "react";

interface ZoomableImageProps {
    src: string;
    alt: string;
    isActive: boolean;
    isZoomEnabled?: boolean; // New prop to control zoom capability
}

export function ZoomableImage({ src, alt, isActive, isZoomEnabled = false }: ZoomableImageProps) {
    // Disable zoom/pan if not active slide OR if zoom is not explicitly enabled (i.e. not in full screen)
    const isDisabled = !isActive || !isZoomEnabled;

    return (
        <div className="w-full h-full flex items-center justify-center">
            <TransformWrapper
                disabled={isDisabled}
                minScale={1}
                maxScale={4}
                doubleClick={{
                    disabled: isDisabled,
                    mode: "reset",
                    step: 2
                }}
                panning={{ disabled: isDisabled }}
                wheel={{ disabled: isDisabled }}
                pinch={{ disabled: isDisabled }}
            >
                <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-screen max-w-full object-contain"
                        style={{ cursor: isDisabled ? 'pointer' : 'grab' }} // Pointer cursor implies clickable
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
}

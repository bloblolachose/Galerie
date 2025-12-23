"use client";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useState } from "react";

interface ZoomableImageProps {
    src: string;
    alt: string;
    isActive: boolean;
}

export function ZoomableImage({ src, alt, isActive }: ZoomableImageProps) {
    // We can lock interactions if not active slide to prevent zooming background slides
    return (
        <div className="w-full h-full flex items-center justify-center">
            <TransformWrapper
                disabled={!isActive}
                minScale={1}
                maxScale={4}
                doubleClick={{
                    disabled: false,
                    mode: "reset",
                    step: 2
                }}
            >
                <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-screen max-w-full object-contain" // Preserves aspect ratio with letterboxing if needed
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
}

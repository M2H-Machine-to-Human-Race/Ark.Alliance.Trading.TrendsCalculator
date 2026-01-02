/**
 * @fileoverview HTTP Method Enum
 * @module enums/common/HttpMethod
 * 
 * Standard HTTP methods for REST APIs.
 * 
 * @author Armand Richelet-Kleinberg
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * HTTP method values
 * 
 * @remarks
 * Standard REST API HTTP methods.
 */
export enum HttpMethod {
    /** Retrieve data */
    GET = 'GET',
    /** Create new resource */
    POST = 'POST',
    /** Update entire resource */
    PUT = 'PUT',
    /** Update partial resource */
    PATCH = 'PATCH',
    /** Delete resource */
    DELETE = 'DELETE',
    /** Get headers only */
    HEAD = 'HEAD',
    /** Get supported methods */
    OPTIONS = 'OPTIONS'
}

/**
 * Zod schema for HttpMethod validation
 */
export const HttpMethodSchema = z.nativeEnum(HttpMethod);

/**
 * Type for validated HttpMethod
 */
export type HttpMethodType = z.infer<typeof HttpMethodSchema>;

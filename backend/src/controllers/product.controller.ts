import { Request, Response } from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    isSkuTaken,
    ProductInput,
    ProductUpdateInput,
} from '../services/product.service';

const validateCommonProductInput = (
    body: any
): { valid: boolean; message?: string } => {
    if (
        typeof body.product_name !== 'string' ||
        !body.product_name.trim()
    ) {
        return {
            valid: false,
            message: 'Product name is required',
        };
    }

    if (
        typeof body.sku !== 'string' ||
        !body.sku.trim()
    ) {
        return {
            valid: false,
            message: 'SKU is required',
        };
    }

    if (
        typeof body.category !== 'string' ||
        !body.category.trim()
    ) {
        return {
            valid: false,
            message: 'Category is required',
        };
    }

    if (
        typeof body.unit_price !== 'number' ||
        body.unit_price < 0
    ) {
        return {
            valid: false,
            message: 'Unit price must be a non-negative number',
        };
    }

    if (
        !Number.isInteger(body.minimum_stock_quantity) ||
        body.minimum_stock_quantity < 0
    ) {
        return {
            valid: false,
            message:
                'Minimum stock quantity must be a non-negative integer',
        };
    }

    if (
        typeof body.warehouse_location !== 'string' ||
        !body.warehouse_location.trim()
    ) {
        return {
            valid: false,
            message: 'Warehouse location is required',
        };
    }

    return { valid: true };
};

const validateCreateProductInput = (
    body: any
): { valid: boolean; message?: string } => {
    const commonValidation = validateCommonProductInput(body);

    if (!commonValidation.valid) {
        return commonValidation;
    }

    if (
        !Number.isInteger(body.current_stock) ||
        body.current_stock < 0
    ) {
        return {
            valid: false,
            message: 'Current stock must be a non-negative integer',
        };
    }

    return { valid: true };
};

const buildProductInput = (
    body: any
): ProductInput => ({
    product_name: body.product_name.trim(),
    sku: body.sku.trim(),
    category: body.category.trim(),
    unit_price: body.unit_price,
    current_stock: body.current_stock,
    minimum_stock_quantity: body.minimum_stock_quantity,
    warehouse_location: body.warehouse_location.trim(),
});

const buildProductUpdateInput = (
    body: any
): ProductUpdateInput => ({
    product_name: body.product_name.trim(),
    sku: body.sku.trim(),
    category: body.category.trim(),
    unit_price: body.unit_price,
    minimum_stock_quantity: body.minimum_stock_quantity,
    warehouse_location: body.warehouse_location.trim(),
});

export const getProductsController = async (
    _req: Request,
    res: Response
): Promise<void> => {
    try {
        const products = await getAllProducts();

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error(
            '[Product Controller] Get products:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
        });
    }
};

export const getProductController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Product ID is required',
            });
            return;
        }

        const product = await getProductById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error(
            '[Product Controller] Get product:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
        });
    }
};

export const createProductController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const validation = validateCreateProductInput(
            req.body
        );

        if (!validation.valid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        }

        const product = buildProductInput(req.body);

        const skuTaken = await isSkuTaken(product.sku);

        if (skuTaken) {
            res.status(409).json({
                success: false,
                message: 'SKU already exists',
            });
            return;
        }

        const createdProduct = await createProduct(product);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: createdProduct,
        });
    } catch (error) {
        console.error(
            '[Product Controller] Create product:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to create product',
        });
    }
};

export const updateProductController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Product ID is required',
            });
            return;
        }

        const validation = validateCommonProductInput(
            req.body
        );

        if (!validation.valid) {
            res.status(400).json({
                success: false,
                message: validation.message,
            });
            return;
        }

        const existingProduct = await getProductById(id);

        if (!existingProduct) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }

        const product = buildProductUpdateInput(req.body);

        const skuTaken = await isSkuTaken(product.sku, id);

        if (skuTaken) {
            res.status(409).json({
                success: false,
                message: 'SKU already exists',
            });
            return;
        }

        const updatedProduct = await updateProduct(
            id,
            product
        );

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        });
    } catch (error) {
        console.error(
            '[Product Controller] Update product:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to update product',
        });
    }
};

export const deleteProductController = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Product ID is required',
            });
            return;
        }

        const deletedProduct = await deleteProduct(id);

        if (!deletedProduct) {
            res.status(404).json({
                success: false,
                message: 'Product not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error(
            '[Product Controller] Delete product:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
        });
    }
};
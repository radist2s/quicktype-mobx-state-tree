import {types} from 'mobx-state-tree'

// To parse this data:
//
//   import { Convert, Product } from "./file";
//
//   const product = Convert.toProduct(json);

export const Attributes = types.model('Attributes', {
    /**
     * Attribute ID.
     */
    id: types.maybe(types.number),
    /**
     * Attribute name.
     */
    name: types.maybe(types.string),
    /**
     * List of available term names of the attribute.
     */
    options: types.maybe(types.array(types.string)),
    /**
     * Attribute position.
     */
    position: types.maybe(types.number),
    /**
     * Define if the attribute can be used as variation.
     */
    variation: types.maybe(types.boolean),
    /**
     * Define if the attribute is visible on the "Additional information" tab in the product's
     * page.
     */
    visible: types.maybe(types.boolean),
})

/**
 * If managing stock, this controls if backorders are allowed.
 */
export enum Backorders {
    No = "no",
    Notify = "notify",
    Yes = "yes",
}

/**
 * Catalog visibility.
 */
export enum CatalogVisibility {
    Catalog = "catalog",
    Hidden = "hidden",
    Search = "search",
    Visible = "visible",
}

export const Categories = types.model('Categories', {
    /**
     * Category ID.
     */
    id: types.maybe(types.number),
    /**
     * Category name.
     */
    name: types.maybe(types.string),
    /**
     * Category slug.
     */
    slug: types.maybe(types.string),
})

export const DefaultAttributes = types.model('DefaultAttributes', {
    /**
     * Attribute ID.
     */
    id: types.maybe(types.number),
    /**
     * Attribute name.
     */
    name: types.maybe(types.string),
    /**
     * Selected attribute term name.
     */
    option: types.maybe(types.string),
})

export const Downloads = types.model('Downloads', {
    /**
     * File URL.
     */
    file: types.maybe(types.string),
    /**
     * File ID.
     */
    id: types.maybe(types.string),
    /**
     * File name.
     */
    name: types.maybe(types.string),
})

export const Images = types.model('Images', {
    /**
     * Image alternative text.
     */
    alt: types.maybe(types.string),
    /**
     * The date the image was created, in the site's timezone.
     */
    date_created: types.maybe(types.Date),
    /**
     * The date the image was created, as GMT.
     */
    date_created_gmt: types.maybe(types.Date),
    /**
     * The date the image was last modified, in the site's timezone.
     */
    date_modified: types.maybe(types.Date),
    /**
     * The date the image was last modified, as GMT.
     */
    date_modified_gmt: types.maybe(types.Date),
    /**
     * Image ID.
     */
    id: types.maybe(types.number),
    /**
     * Image name.
     */
    name: types.maybe(types.string),
    /**
     * Image URL.
     */
    src: types.maybe(types.string),
})

export const MetaData = types.model('MetaData', {
    /**
     * Meta ID.
     */
    id: types.maybe(types.number),
    /**
     * Meta key.
     */
    key: types.maybe(types.string),
    /**
     * Meta value.
     */
    value: types.maybe(types.union(types.array(types.frozen()), types.boolean, types.number, types.number, types.frozen(), types.null, types.string)),
})

/**
 * Product status (post status).
 */
export enum Status {
    Any = "any",
    AutoDraft = "auto-draft",
    Draft = "draft",
    Failed = "failed",
    Future = "future",
    InProgress = "in-progress",
    Inherit = "inherit",
    Pending = "pending",
    Private = "private",
    Publish = "publish",
    RequestCompleted = "request-completed",
    RequestConfirmed = "request-confirmed",
    RequestFailed = "request-failed",
    RequestPending = "request-pending",
    Trash = "trash",
    Vacation = "vacation",
    WcCancelled = "wc-cancelled",
    WcCompleted = "wc-completed",
    WcFailed = "wc-failed",
    WcOnHold = "wc-on-hold",
    WcPending = "wc-pending",
    WcProcessing = "wc-processing",
    WcRefunded = "wc-refunded",
    WcmActive = "wcm-active",
    WcmCancelled = "wcm-cancelled",
    WcmComplimentary = "wcm-complimentary",
    WcmDelayed = "wcm-delayed",
    WcmExpired = "wcm-expired",
    WcmPaused = "wcm-paused",
    WcmPending = "wcm-pending",
}

/**
 * Controls the stock status of the product.
 */
export enum StockStatus {
    Instock = "instock",
    Onbackorder = "onbackorder",
    Outofstock = "outofstock",
}

export const Tags = types.model('Tags', {
    /**
     * Tag ID.
     */
    id: types.maybe(types.number),
    /**
     * Tag name.
     */
    name: types.maybe(types.string),
    /**
     * Tag slug.
     */
    slug: types.maybe(types.string),
})

/**
 * Tax status.
 */
export enum TaxStatus {
    None = "none",
    Shipping = "shipping",
    Taxable = "taxable",
}

/**
 * Product type.
 */
export enum Type {
    External = "external",
    Grouped = "grouped",
    Simple = "simple",
    Variable = "variable",
}

export const Product = types.model('Product', {
    /**
     * List of attributes.
     */
    attributes: types.maybe(types.array(Attributes)),
    /**
     * If managing stock, this controls if backorders are allowed.
     */
    backorders: types.maybe(types.enumeration<Backorders>('Backorders', Object.values(Backorders))),
    /**
     * Product external button text. Only for external products.
     */
    button_text: types.maybe(types.string),
    /**
     * Catalog visibility.
     */
    catalog_visibility: types.maybe(types.enumeration<CatalogVisibility>('CatalogVisibility', Object.values(CatalogVisibility))),
    /**
     * List of categories.
     */
    categories: types.maybe(types.array(Categories)),
    /**
     * List of cross-sell products IDs.
     */
    cross_sell_ids: types.maybe(types.array(types.number)),
    /**
     * The date the product was created, in the site's timezone.
     */
    date_created: types.maybe(types.Date),
    /**
     * The date the product was created, as GMT.
     */
    date_created_gmt: types.maybe(types.Date),
    /**
     * Start date of sale price, in the site's timezone.
     */
    date_on_sale_from: types.maybe(types.Date),
    /**
     * Start date of sale price, as GMT.
     */
    date_on_sale_from_gmt: types.maybe(types.Date),
    /**
     * End date of sale price, in the site's timezone.
     */
    date_on_sale_to: types.maybe(types.Date),
    /**
     * End date of sale price, in the site's timezone.
     */
    date_on_sale_to_gmt: types.maybe(types.Date),
    /**
     * Defaults variation attributes.
     */
    default_attributes: types.maybe(types.array(DefaultAttributes)),
    /**
     * Product description.
     */
    description: types.maybe(types.string),
    /**
     * Product dimensions.
     */
    dimensions: types.maybe(types.frozen()),
    /**
     * Number of days until access to downloadable files expires.
     */
    download_expiry: types.maybe(types.number),
    /**
     * Number of times downloadable files can be downloaded after purchase.
     */
    download_limit: types.maybe(types.number),
    /**
     * If the product is downloadable.
     */
    downloadable: types.maybe(types.boolean),
    /**
     * List of downloadable files.
     */
    downloads: types.maybe(types.array(Downloads)),
    /**
     * Product external URL. Only for external products.
     */
    external_url: types.maybe(types.string),
    /**
     * Featured product.
     */
    featured: types.maybe(types.boolean),
    /**
     * Unique identifier for the resource.
     */
    id: types.maybe(types.number),
    /**
     * List of images.
     */
    images: types.maybe(types.array(Images)),
    /**
     * Stock management at product level.
     */
    manage_stock: types.maybe(types.boolean),
    /**
     * Menu order, used to custom sort products.
     */
    menu_order: types.maybe(types.number),
    /**
     * Meta data.
     */
    meta_data: types.maybe(types.array(MetaData)),
    /**
     * Product name.
     */
    name: types.maybe(types.string),
    /**
     * Product parent ID.
     */
    parent_id: types.maybe(types.number),
    /**
     * Optional note to send the customer after purchase.
     */
    purchase_note: types.maybe(types.string),
    /**
     * Product regular price.
     */
    regular_price: types.maybe(types.string),
    /**
     * Allow reviews.
     */
    reviews_allowed: types.maybe(types.boolean),
    /**
     * Product sale price.
     */
    sale_price: types.maybe(types.string),
    /**
     * Shipping class slug.
     */
    shipping_class: types.maybe(types.string),
    /**
     * Product short description.
     */
    short_description: types.maybe(types.string),
    /**
     * Unique identifier.
     */
    sku: types.maybe(types.string),
    /**
     * Product slug.
     */
    slug: types.maybe(types.string),
    /**
     * Allow one item to be bought in a single order.
     */
    sold_individually: types.maybe(types.boolean),
    /**
     * Product status (post status).
     */
    status: types.maybe(types.enumeration<Status>('Status', Object.values(Status))),
    /**
     * Stock quantity.
     */
    stock_quantity: types.maybe(types.union(types.number, types.null)),
    /**
     * Controls the stock status of the product.
     */
    stock_status: types.maybe(types.enumeration<StockStatus>('StockStatus', Object.values(StockStatus))),
    /**
     * List of tags.
     */
    tags: types.maybe(types.array(Tags)),
    /**
     * Tax class.
     */
    tax_class: types.maybe(types.string),
    /**
     * Tax status.
     */
    tax_status: types.maybe(types.enumeration<TaxStatus>('TaxStatus', Object.values(TaxStatus))),
    /**
     * Product type.
     */
    type: types.maybe(types.enumeration<Type>('Type', Object.values(Type))),
    /**
     * List of up-sell products IDs.
     */
    upsell_ids: types.maybe(types.array(types.number)),
    /**
     * If the product is virtual.
     */
    virtual: types.maybe(types.boolean),
    /**
     * Product weight (kg).
     */
    weight: types.maybe(types.string),
})

// Converts JSON strings to/from your types
export class Convert {
    public static toProduct(json: string): Product {
        return JSON.parse(json);
    }

    public static productToJson(value: Product): string {
        return JSON.stringify(value);
    }
}

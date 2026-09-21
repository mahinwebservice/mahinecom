import React from 'react';
import type { LayoutBlock, Product, Service } from '@/types';
import Link from 'next/link';
import { ArrowRight, ShoppingCart, FileText } from 'lucide-react';

interface Props {
  blocks: LayoutBlock[];
  tenantId: string;
}

export const HomepageRenderer = ({ blocks, tenantId }: Props) => {
  if (!blocks || blocks.length === 0) {
    return <div className="text-center py-20 text-gray-500">No layout blocks found for this store.</div>;
  }

  return (
    <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {blocks.sort((a, b) => a.order - b.order).map((block) => (
        <div key={block.id} className="w-full">
          {block.type === 'hero_slider' && <HeroSlider data={block.data} tenantId={tenantId} />}
          {block.type === 'product_grid' && <ProductGrid data={block.data} tenantId={tenantId} />}
          {block.type === 'service_cards' && <ServiceCards data={block.data} tenantId={tenantId} />}
          {block.type === 'banner_cta' && <BannerCTA data={block.data} tenantId={tenantId} />}
          {block.type === 'custom_html' && <CustomHTML data={block.data} />}
        </div>
      ))}
    </div>
  );
};

// Internal Block Components

const HeroSlider = ({ data, tenantId }: { data: any, tenantId: string }) => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
      {data.imageUrl && (
        <img 
          src={data.imageUrl} 
          alt={data.title || 'Hero Banner'} 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      )}
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {data.title}
        </h1>
        {data.subtitle && <p className="text-lg md:text-xl text-gray-200 mb-8">{data.subtitle}</p>}
        {data.ctaLink && (
          <Link 
            href={`/${tenantId}${data.ctaLink}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            {data.ctaText || 'Shop Now'} <ArrowRight className="w-5 h-5" />
          </Link>
        )}
      </div>
    </div>
  );
};

const ProductGrid = ({ data, tenantId }: { data: any, tenantId: string }) => {
  // In a real app, this component might fetch products based on a category/filter passed in data.
  // For now, we assume data.products contains a snapshot or we fetch client-side.
  const products: Product[] = data.products || [];

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-bold tracking-tight">{data.title || 'Featured Products'}</h2>
        {data.viewAllLink && (
          <Link href={`/${tenantId}${data.viewAllLink}`} className="text-blue-600 hover:underline">
            View All
          </Link>
        )}
      </div>
      
      {products.length === 0 ? (
        <div className="p-8 border border-dashed rounded-lg text-center text-gray-500">
          No products to display in this grid.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/${tenantId}/products/${product.slug}`} className="group border rounded-xl overflow-hidden hover:shadow-lg transition bg-white flex flex-col">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.images && product.images[0] ? (
                  <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full group-hover:scale-105 transition duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg">৳{product.salePrice || product.regularPrice}</span>
                    {product.salePrice && product.salePrice < product.regularPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">৳{product.regularPrice}</span>
                    )}
                  </div>
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const ServiceCards = ({ data, tenantId }: { data: any, tenantId: string }) => {
  const services: Service[] = data.services || [];

  return (
    <div className="w-full bg-slate-50 rounded-3xl p-8 md:p-12">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-12">{data.title || 'Our Industrial Services'}</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{service.title}</h3>
            <p className="text-gray-600 mb-6 line-clamp-3">{service.scopeOfWork}</p>
            <div className="flex flex-col gap-3">
              <Link href={`/${tenantId}/services/${service.slug}`} className="w-full py-2.5 px-4 rounded-lg bg-gray-100 text-center font-medium hover:bg-gray-200 transition">
                View Details
              </Link>
              {service.allowsQuotation && (
                <button className="w-full py-2.5 px-4 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition">
                  Request Quotation
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BannerCTA = ({ data, tenantId }: { data: any, tenantId: string }) => {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-blue-600 flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">{data.title}</h2>
        <p className="text-blue-100 text-lg mb-0">{data.subtitle}</p>
      </div>
      <div className="mt-8 md:mt-0 flex-shrink-0">
        <Link 
          href={`/${tenantId}${data.ctaLink}`}
          className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:shadow-lg transition inline-block"
        >
          {data.ctaText}
        </Link>
      </div>
    </div>
  );
};

const CustomHTML = ({ data }: { data: any }) => {
  return (
    <div 
      className="w-full prose max-w-none" 
      dangerouslySetInnerHTML={{ __html: data.htmlContent || '' }} 
    />
  );
};

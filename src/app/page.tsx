import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { HeroSection } from "@/components/home/HeroSection";


export default function Home() {
  return (
    <div >
      <HeroSection/>
      <CategorySection/>
      <FeaturedProductsSection/>
    </div>
  )
}
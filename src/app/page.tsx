import Layout from '@/components/Layout';
import Hero from '@/components/sections/Hero';
import MediaSection from '@/components/sections/MediaSection';
import VideoSection from '@/components/sections/VideoSection';
import PressCenterSlider from '@/components/sections/PressCenterSlider';
import FoundersSlider from '@/components/sections/FoundersSlider';
import { mergeHomeHeroFromDb } from '@/lib/home-hero-defaults';
import { withResolvedHomeHeroFields } from '@/lib/media-url';
import { getHomeHeroRow } from '@/lib/queries/home-hero';

export default async function Home() {
  const heroRow = await getHomeHeroRow();
  const heroContent = mergeHomeHeroFromDb(
    heroRow ? withResolvedHomeHeroFields(heroRow) : null
  );

  return (
    <Layout>
      <Hero content={heroContent} />
      <MediaSection />
      <VideoSection />
      <PressCenterSlider />
      <FoundersSlider />
    </Layout>
  );
}

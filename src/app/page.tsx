import Layout from '@/components/Layout';
import Hero from '@/components/sections/Hero';
import MediaSection from '@/components/sections/MediaSection';
import VideoSection from '@/components/sections/VideoSection';
import PressCenterSlider from '@/components/sections/PressCenterSlider';
import FoundersSlider from '@/components/sections/FoundersSlider';

export default function Home() {
  return (
    <Layout>
      <Hero />
      <MediaSection />
      <VideoSection />
      <PressCenterSlider />
      <FoundersSlider />
    </Layout>
  );
}

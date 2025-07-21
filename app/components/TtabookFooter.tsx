import { DescText } from '@/ds/components/atoms/text/textWrapper';
import Footer from '@/ds/components/molecules/footer/Footer';

const TtabookFooter = () => {
  return (
    <Footer>
      <DescText variant="disabled" style={{ margin: 0 }}>
        © 2025 Ttabook
      </DescText>
    </Footer>
  );
};

export default TtabookFooter;

import React from "react";
import { Flex, Text } from "@radix-ui/themes";

/**
 * Top navigation bar displaying the EmiLabs logo and application name.
 *
 * Renders as an HTML `<header>` with `role="banner"`. Has no props — branding
 * content is static. Intended to be mounted once inside `AppShell`.
 *
 * @author Martin Sandoval
 */
const AppHeader: React.FC = () => {
  return (
    <header className="AppHeader" role="banner">
      <Flex align="center" gap="2" className="AppHeaderInner">
        <div className="AppLogoMark AppLogoMark--sm">EL</div>
        <Text size="3" weight="bold" className="AppHeaderTitle">
          EmiLabs
        </Text>
      </Flex>
    </header>
  );
};

export default AppHeader;

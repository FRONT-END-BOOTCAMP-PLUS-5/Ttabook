# Ttabook Design System

> Next.js based design system from the Ttabook group

A comprehensive, reusable component library built with React, TypeScript, and CSS Modules, following atomic design principles.

## 🚀 Installation

```bash
npm install ttabook-design-system
# or
yarn add ttabook-design-system
```

## 📋 Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-dom next @storybook/nextjs @storybook/react storybook
```

## 🎯 Usage

### Basic Import

```typescript
import { Button, Card, Modal } from 'ttabook-design-system';

function App() {
  return (
    <Card>
      <Button variant="primary" size="md">
        Click me
      </Button>
    </Card>
  );
}
```

### Text Components

```typescript
import { Text, TitleText, SubTitleText, DescText, CaptionText } from 'ttabook-design-system';

function TextExample() {
  return (
    <div>
      <TitleText>Main Title</TitleText>
      <SubTitleText>Subtitle</SubTitleText>
      <DescText>Description text</DescText>
      <CaptionText>Caption text</CaptionText>
    </div>
  );
}
```

## 📦 Components

### Atoms

- **Button** - Configurable button with multiple variants and sizes
- **Card** - Generic container with customizable dimensions
- **Icon** - SVG icon component with size and color options
- **Input** - Form input with validation and error states
- **Label** - Styled labels for form elements
- **LoadingSpinner** - Animated loading indicator
- **Modal** - Accessible modal with title, body, and close button
- **Text** - Typography component with variants and sizes
- **Toast** - Notification toast with auto-dismiss

### Molecules

- **Carousel** - Image/content carousel with navigation
- **Footer** - Application footer component
- **Header** - Application header with logo and navigation
- **InputField** - Combined label and input field
- **TimePicker** - Time selection component with availability
- **TimeTile** - Individual time slot component

## 🎨 Design Tokens

The design system includes a comprehensive token system:

- **Colors** - Primary, secondary, and semantic colors
- **Typography** - Text sizes and variants
- **Spacing** - Consistent spacing scale
- **Shadows** - Shadow definitions
- **Component tokens** - Button, input, and toast variants

## 📖 Storybook

All components come with Storybook stories for development and documentation:

```bash
yarn storybook-test
```

## 🛠️ Development

### Building

```bash
yarn build
```

### TypeScript Support

This package includes full TypeScript definitions and supports CSS Modules out of the box.

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Add appropriate tests and stories
5. Submit a pull request

## 📞 Support

- [Issues](https://github.com/FRONT-END-BOOTCAMP-PLUS-5/Ttabook/issues)
- [Repository](https://github.com/FRONT-END-BOOTCAMP-PLUS-5/Ttabook)

---

Built with ❤️ by the Ttabook team

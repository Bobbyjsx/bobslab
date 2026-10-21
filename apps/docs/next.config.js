/** @type {import('next').NextConfig} */
import nextra from 'nextra';

const nextConfig = {
  reactStrictMode: true,
};

const withNextra = nextra({
  latex: true,
  search: {
    codeblocks: true,
  },
});

export default withNextra(nextConfig);

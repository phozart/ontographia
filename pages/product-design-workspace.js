// Legacy redirect: /product-design-workspace -> /app/spaces/pdw/discovery
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/pdw/discovery',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}

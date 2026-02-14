// pages/gtm/materials.js
// Redirect to unified GTM Studio route

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/gtm/enablement',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}

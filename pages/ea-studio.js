// Legacy redirect: /ea-studio -> /app/spaces/ea/elements
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/ea/elements',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}

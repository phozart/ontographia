// Legacy redirect: /requirements-studio -> /app/spaces/ba/repository
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/ba/repository',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}

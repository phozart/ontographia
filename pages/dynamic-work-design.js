// Legacy redirect: /dynamic-work-design -> /app/spaces/dwd/landscape
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/dwd/landscape',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}

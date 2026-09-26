import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined };
}

export default async function OrderStatusRedirectPage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const resolvedQuery = props.searchParams ? await Promise.resolve(props.searchParams) : {};
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedQuery)) {
    if (value) queryParams.set(key, value);
  }
  const queryStr = queryParams.toString();
  redirect(`/order/${resolvedParams.id}${queryStr ? `?${queryStr}` : ""}`);
}

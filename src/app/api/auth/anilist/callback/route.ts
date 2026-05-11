import { NextRequest, NextResponse } from "next/server";
import { linkAniListAction, syncAniListAction } from "@/app/actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/watchlist?error=missing_code", request.url));
  }

  const result = await linkAniListAction(code);

  if (result.error) {
    return NextResponse.redirect(new URL(`/watchlist?error=${encodeURIComponent(result.error)}`, request.url));
  }

  // After linking, perform initial sync
  await syncAniListAction();

  return NextResponse.redirect(new URL("/watchlist?success=linked", request.url));
}

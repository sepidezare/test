import clientPromise from "@/lib/mongoDb";
import { resolveObjectURL } from "buffer";
import { url } from "inspector";
import { NextResponse } from "next/server";

export async function GET(request:Request) {
  try{
  const {searchParams}  = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if(!q) return NextResponse.json([]);


  const client = await clientPromise;
const db = client.db();
const collections = await db.collections();
console.log("Collections:", collections.map(c => c.collectionName));

const allProducts = await db.collection("products").find().toArray();
console.log("All products:", allProducts);

  const collection=db.collection("products");

  const results = await collection.find({name:{$regex:q , $options:"i"}}).limit(10).toArray();

  console.log("Search query:", q);
console.log("Results found:", results.length);

  return NextResponse.json(results);
  }
  catch(eror)
  {
    return NextResponse.json([]);
  }
}
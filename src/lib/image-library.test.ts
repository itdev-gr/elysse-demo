import { describe, it, expect, vi } from 'vitest';
import { uploadLibraryImage, LibraryUploadError } from './image-library';

type Client = NonNullable<Parameters<typeof uploadLibraryImage>[1]>;

const ROW = {
  id: 'img-1',
  url: 'https://cdn.test/product-images/uploads/whatever.png',
  filename: 'photo.png',
  family_code: null,
  source: 'upload',
  created_at: '2026-07-20T00:00:00Z',
};

function makeClient({ uploadError = null, insertError = null }: {
  uploadError?: { message: string } | null;
  insertError?: { message: string } | null;
} = {}) {
  const upload = vi.fn(
    async (_path: string, _file: File, _opts: { upsert: boolean; contentType: string }) =>
      ({ error: uploadError }),
  );
  const getPublicUrl = vi.fn((path: string) => ({
    data: { publicUrl: `https://cdn.test/product-images/${path}` },
  }));
  const single = vi.fn(async () =>
    insertError ? { data: null, error: insertError } : { data: ROW, error: null });
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn((_values: Record<string, unknown>) => ({ select }));
  const client = {
    storage: { from: vi.fn(() => ({ upload, getPublicUrl })) },
    from: vi.fn(() => ({ insert })),
  };
  return { client: client as unknown as Client, upload, getPublicUrl, insert };
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

describe('uploadLibraryImage', () => {
  it('uploads to uploads/<uuid>-<sanitised>, records the row, returns it', async () => {
    const { client, upload, getPublicUrl, insert } = makeClient();
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    const row = await uploadLibraryImage(file, client);

    expect(row).toEqual(ROW);
    const [path, sentFile, opts] = upload.mock.calls[0];
    expect(path).toMatch(new RegExp(`^uploads/${UUID}-photo\\.png$`));
    expect(sentFile).toBe(file);
    expect(opts).toEqual({ upsert: true, contentType: 'image/png' });
    expect(getPublicUrl).toHaveBeenCalledWith(path);
    expect(insert).toHaveBeenCalledWith({
      url: `https://cdn.test/product-images/${path}`,
      filename: 'photo.png',
      family_code: null,
      source: 'upload',
    });
  });

  it('sanitises the storage path but keeps the original filename in the record', async () => {
    const { client, upload, insert } = makeClient();
    await uploadLibraryImage(new File(['x'], 'my photo (1).png', { type: 'image/png' }), client);
    expect(upload.mock.calls[0][0]).toMatch(/-my-photo-1-\.png$/);
    expect(insert.mock.calls[0][0]).toMatchObject({ filename: 'my photo (1).png' });
  });

  it('throws a stage "upload" error and skips the insert when storage fails', async () => {
    const { client, insert } = makeClient({ uploadError: { message: 'quota exceeded' } });
    const err = await uploadLibraryImage(new File(['x'], 'a.png', { type: 'image/png' }), client)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(LibraryUploadError);
    expect((err as LibraryUploadError).stage).toBe('upload');
    expect((err as LibraryUploadError).message).toBe('quota exceeded');
    expect(insert).not.toHaveBeenCalled();
  });

  it('throws a stage "insert" error when the record insert fails', async () => {
    const { client } = makeClient({ insertError: { message: 'RLS says no' } });
    const err = await uploadLibraryImage(new File(['x'], 'a.png', { type: 'image/png' }), client)
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(LibraryUploadError);
    expect((err as LibraryUploadError).stage).toBe('insert');
    expect((err as LibraryUploadError).message).toBe('RLS says no');
  });
});

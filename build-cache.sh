# Sync the cache into the working tree, using tar on the first run for
# better performance, otherwise using rsync, preserving timestamps (--times)
# and making sure that newer files in the working tree aren't overwritten by
# older files in the cache (--update).
cache_dir=/home/node/.cache/yarn/v4

cd /app

mkdir -p cache/$cache_dir $cache_dir
if [[ -z "$(ls -A $cache_dir)" ]]; then
  echo "tar: Copying cache/$cache_dir to $cache_dir"
  (cd cache/$cache_dir; tar cf - .) | (cd $cache_dir; tar xpf -)
else
  echo "rsync: Copying cache/$cache_dir to $cache_dir"
  rsync --archive --times --update cache/$cache_dir/ $cache_dir
fi

cd $1 && test -f package.json && yarn install || true
cd /app

# Sync the working tree back to the cache, using tar on the first run for
# better performance, otherwise using rsync, preserving timestamps (--times) and
# removing any files from the cache that are no longer present in the working
# tree (--delete).
if [[ -z "$(ls -A cache/$cache_dir)" ]]; then
  echo "tar: Caching $cache_dir to cache/$cache_dir"
  (cd $cache_dir; tar cf - .) | (cd cache/$cache_dir; tar xpf -)
else
  echo "rsync: Caching $cache_dir to cache/$cache_dir"
  rsync --archive --times --delete $cache_dir/ cache/$cache_dir
fi

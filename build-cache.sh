# Sync the cache into the working tree, using tar on the first run for
# better performance, otherwise using rsync, preserving timestamps (--times)
# and making sure that newer files in the working tree aren't overwritten by
# older files in the cache (--update).
cd /app

for dir in /home/node/.cache/yarn/v4 $1/node_modules
do
  mkdir -p cache/$dir $dir
  if [[ -z "$(ls -A $dir)" ]]; then
    echo "tar: Copying cache/$dir to $dir"
    (cd cache/$dir; tar cf - .) | (cd $dir; tar xpf -)
  else
    echo "rsync: Copying cache/$dir to $dir"
    rsync --archive --times --update cache/$dir/ $dir
  fi
  ls -al $dir
done

cd $1 && test -f package.json && yarn install || true
cd /app

# Sync the working tree back to the cache, using tar on the first run for
# better performance, otherwise using rsync, preserving timestamps (--times) and
# removing any files from the cache that are no longer present in the working
# tree (--delete).
for dir in /home/node/.cache/yarn/v4 $1/node_modules
do
  if [[ -z "$(ls -A cache/$dir)" ]]; then
    echo "tar: Caching $dir to cache/$dir"
    (cd $dir; tar cf - .) | (cd cache/$dir; tar xpf -)
  else
    echo "rsync: Caching $dir to cache/$dir"
    rsync --archive --times --delete $dir/ cache/$dir
  fi
  ls -al cache/$dir
done
